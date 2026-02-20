import { randomBytes } from "node:crypto";
import { Types } from "mongoose";
import { CacheEntry } from "~/server/models/CacheEntry";
import { StaticNode } from "~/server/models/StaticNode";
import { Tag } from "~/server/models/Tag";
import { Upstream } from "~/server/models/Upstream";
import { User } from "~/server/models/User";
import { UserToken } from "~/server/models/UserToken";
import { logAudit } from "~/server/utils/audit";
import { cacheService } from "~/server/utils/services/cache-service";
import { mergeUserTagIds } from "~/server/utils/services/tag-assignment";
import {
  decryptToken,
  encryptToken,
  hashToken,
} from "~/server/utils/encryption";
import type {
  CreateUserBody,
  ListUsersQuery,
  UpdateUserBody,
} from "~/server/utils/validation/schemas/users";

const dedupeIds = (ids: string[]): string[] => {
  return [...new Set(ids)];
};

const assertValidObjectIdList = (
  ids: string[],
  fieldName: string,
): string[] => {
  const normalized = dedupeIds(ids.map((id) => id.trim()).filter(Boolean));
  const invalid = normalized.filter((id) => !Types.ObjectId.isValid(id));

  if (invalid.length) {
    throw createError({
      statusCode: 400,
      statusMessage: `${fieldName} contains invalid id(s)`,
    });
  }

  return normalized;
};

const ensureTagIdsExist = async (tagIds: string[]): Promise<string[]> => {
  if (!tagIds.length) {
    return [];
  }

  const normalized = assertValidObjectIdList(tagIds, "tagIds");
  if (!normalized.length) {
    return [];
  }

  const existing = await Tag.find({
    _id: { $in: normalized },
  }).select("_id");

  if (existing.length !== normalized.length) {
    throw createError({
      statusCode: 400,
      statusMessage: "One or more tagIds do not exist",
    });
  }

  return normalized;
};

const resolveCreateTagIds = async (
  inputTagIds?: string[],
): Promise<string[]> => {
  const selectedTagIds = await ensureTagIdsExist(inputTagIds || []);

  const defaultTags = await Tag.find({ isDefault: true }).select("_id");
  const merged = mergeUserTagIds(
    selectedTagIds,
    defaultTags.map((tag) => String(tag._id)),
  );

  return merged;
};

const list = async (query: ListUsersQuery) => {
  const filter: {
    tagIds?: string;
  } = {};

  if (query.tagId) {
    filter.tagIds = query.tagId;
  }

  return User.find(filter).sort({ createdAt: -1 });
};

const createWithToken = async (actorAdminId: string, input: CreateUserBody) => {
  const existing = await User.findOne({ label: input.label });
  if (existing) {
    throw createError({
      statusCode: 400,
      statusMessage: "Label already exists",
    });
  }

  const tagIds = await resolveCreateTagIds(input.tagIds);

  const user = await User.create({
    label: input.label,
    email: input.email,
    tagIds,
    isActive: true,
  });

  const rawToken = randomBytes(32).toString("hex");
  const tokenHash = hashToken(rawToken);
  const tokenCiphertext = encryptToken(rawToken);

  await UserToken.create({
    userId: user._id,
    tokenHash,
    tokenCiphertext,
  });

  await logAudit({
    actorAdminId,
    action: "CREATE_USER",
    targetType: "User",
    targetId: String(user._id),
    metadata: { label: user.label, tagIds },
  });

  return { user, token: rawToken };
};

const getWithToken = async (id: string) => {
  const user = await User.findById(id);
  if (!user) {
    throw createError({ statusCode: 404, statusMessage: "User not found" });
  }

  const tokenRecord = await UserToken.findOne({ userId: id, revokedAt: null });
  let token: string | null = null;

  if (tokenRecord) {
    try {
      token = decryptToken(tokenRecord.tokenCiphertext);
    } catch {
      token = "DECRYPTION_FAILED";
    }
  }

  return { ...user.toObject(), token };
};

const update = async (
  actorAdminId: string,
  id: string,
  input: UpdateUserBody,
) => {
  const updatePayload: {
    label?: string;
    email?: string;
    isActive?: boolean;
    tagIds?: string[];
  } = {};

  if (input.label !== undefined) {
    updatePayload.label = input.label;
  }
  if (input.email !== undefined) {
    updatePayload.email = input.email;
  }
  if (input.isActive !== undefined) {
    updatePayload.isActive = input.isActive;
  }
  if (input.tagIds !== undefined) {
    updatePayload.tagIds = await ensureTagIdsExist(input.tagIds);
  }

  const user = await User.findByIdAndUpdate(id, updatePayload, {
    returnDocument: "after",
  });

  if (!user) {
    throw createError({ statusCode: 404, statusMessage: "User not found" });
  }

  if (input.tagIds !== undefined || input.isActive !== undefined) {
    await cacheService.invalidateUsersCache([id]);
  }

  await logAudit({
    actorAdminId,
    action: "UPDATE_USER",
    targetType: "User",
    targetId: id,
    metadata: updatePayload,
  });

  return user;
};

const getExistingUserIds = async (userIds: string[]): Promise<string[]> => {
  const normalized = assertValidObjectIdList(userIds, "userIds");
  if (!normalized.length) {
    return [];
  }

  const users = await User.find({
    _id: { $in: normalized },
  }).select("_id");

  return users.map((user) => String(user._id));
};

const deleteCascadeByIds = async (userIds: string[]): Promise<number> => {
  const existingUserIds = await getExistingUserIds(userIds);
  if (!existingUserIds.length) {
    return 0;
  }

  await Promise.all([
    User.deleteMany({ _id: { $in: existingUserIds } }),
    UserToken.deleteMany({ userId: { $in: existingUserIds } }),
    Upstream.deleteMany({ userId: { $in: existingUserIds } }),
    StaticNode.deleteMany({ userId: { $in: existingUserIds } }),
    CacheEntry.deleteMany({ userId: { $in: existingUserIds } }),
  ]);

  return existingUserIds.length;
};

const deactivateByIds = async (userIds: string[]): Promise<number> => {
  const existingUserIds = await getExistingUserIds(userIds);
  if (!existingUserIds.length) {
    return 0;
  }

  const result = await User.updateMany(
    { _id: { $in: existingUserIds }, isActive: true },
    { isActive: false },
  );

  await cacheService.invalidateUsersCache(existingUserIds);

  return result.modifiedCount;
};

const rotateTokensByIds = async (userIds: string[]): Promise<number> => {
  const existingUserIds = await getExistingUserIds(userIds);
  if (!existingUserIds.length) {
    return 0;
  }

  await UserToken.updateMany(
    { userId: { $in: existingUserIds }, revokedAt: null },
    { revokedAt: new Date() },
  );

  await UserToken.insertMany(
    existingUserIds.map((userId) => {
      const rawToken = randomBytes(32).toString("hex");

      return {
        userId,
        tokenHash: hashToken(rawToken),
        tokenCiphertext: encryptToken(rawToken),
      };
    }),
  );

  await cacheService.invalidateUsersCache(existingUserIds);

  return existingUserIds.length;
};

const deleteCascade = async (actorAdminId: string, id: string) => {
  const deletedUsers = await deleteCascadeByIds([id]);
  if (!deletedUsers) {
    throw createError({ statusCode: 404, statusMessage: "User not found" });
  }

  await logAudit({
    actorAdminId,
    action: "DELETE_USER",
    targetType: "User",
    targetId: id,
  });

  return { success: true };
};

const rotateToken = async (actorAdminId: string, id: string) => {
  const user = await User.findById(id).select("_id");
  if (!user) {
    throw createError({ statusCode: 404, statusMessage: "User not found" });
  }

  await UserToken.updateMany(
    { userId: id, revokedAt: null },
    { revokedAt: new Date() },
  );

  const rawToken = randomBytes(32).toString("hex");
  const tokenHash = hashToken(rawToken);
  const tokenCiphertext = encryptToken(rawToken);

  await UserToken.create({
    userId: id,
    tokenHash,
    tokenCiphertext,
  });

  await cacheService.invalidateUsersCache([id]);

  await logAudit({
    actorAdminId,
    action: "ROTATE_TOKEN",
    targetType: "User",
    targetId: id,
  });

  return { token: rawToken };
};

export const userService = {
  list,
  createWithToken,
  getWithToken,
  update,
  deleteCascade,
  rotateToken,
  deleteCascadeByIds,
  deactivateByIds,
  rotateTokensByIds,
};
