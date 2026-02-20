import { StaticNode } from "~/server/models/StaticNode";
import { Tag, normalizeTagName } from "~/server/models/Tag";
import { Upstream } from "~/server/models/Upstream";
import { User } from "~/server/models/User";
import { logAudit } from "~/server/utils/audit";
import { cacheService } from "~/server/utils/services/cache-service";
import { userService } from "~/server/utils/services/user-service";
import type {
  CreateTagBody,
  TagBulkActionBody,
  TagApplyBody,
  UpdateTagBody,
} from "~/server/utils/validation/schemas/tags";

const isMongoDuplicateKeyError = (error: unknown): boolean => {
  if (typeof error !== "object" || !error) {
    return false;
  }

  const candidate = error as { code?: number };
  return candidate.code === 11000;
};

const ensureTagExists = async (id: string) => {
  const tag = await Tag.findById(id);
  if (!tag) {
    throw createError({ statusCode: 404, statusMessage: "Tag not found" });
  }
  return tag;
};

const list = async () => {
  return Tag.find().sort({ createdAt: -1 });
};

const getById = async (id: string) => {
  return ensureTagExists(id);
};

const create = async (actorAdminId: string, input: CreateTagBody) => {
  const normalizedName = normalizeTagName(input.name);

  const existing = await Tag.findOne({ normalizedName }).select("_id");
  if (existing) {
    throw createError({
      statusCode: 400,
      statusMessage: "Tag name already exists",
    });
  }

  try {
    const tag = await Tag.create({
      name: input.name.trim(),
      normalizedName,
      isDefault: input.isDefault ?? false,
    });

    await logAudit({
      actorAdminId,
      action: "CREATE_TAG",
      targetType: "Tag",
      targetId: String(tag._id),
      metadata: {
        name: tag.name,
        isDefault: tag.isDefault,
      },
    });

    return tag;
  } catch (error) {
    if (isMongoDuplicateKeyError(error)) {
      throw createError({
        statusCode: 400,
        statusMessage: "Tag name already exists",
      });
    }
    throw error;
  }
};

const update = async (
  actorAdminId: string,
  id: string,
  input: UpdateTagBody,
) => {
  const tag = await ensureTagExists(id);

  if (input.name !== undefined) {
    const normalizedName = normalizeTagName(input.name);
    const existing = await Tag.findOne({
      normalizedName,
      _id: { $ne: id },
    }).select("_id");

    if (existing) {
      throw createError({
        statusCode: 400,
        statusMessage: "Tag name already exists",
      });
    }

    tag.name = input.name.trim();
    tag.normalizedName = normalizedName;
  }

  if (input.isDefault !== undefined) {
    tag.isDefault = input.isDefault;
  }

  try {
    await tag.save();
  } catch (error) {
    if (isMongoDuplicateKeyError(error)) {
      throw createError({
        statusCode: 400,
        statusMessage: "Tag name already exists",
      });
    }
    throw error;
  }

  await logAudit({
    actorAdminId,
    action: "UPDATE_TAG",
    targetType: "Tag",
    targetId: id,
    metadata: input,
  });

  return tag;
};

const remove = async (actorAdminId: string, id: string) => {
  await ensureTagExists(id);

  const users = await User.find({ tagIds: id }).select("_id");
  const userIds = users.map((user) => String(user._id));

  const detachResult = await User.updateMany(
    { tagIds: id },
    { $pull: { tagIds: id } },
  );

  const [deletedUpstreams, deletedStaticNodes] = await Promise.all([
    Upstream.deleteMany({ scope: "TAG", tagId: id }),
    StaticNode.deleteMany({ scope: "TAG", tagId: id }),
  ]);

  if (userIds.length) {
    await cacheService.invalidateUsersCache(userIds);
  }

  await Tag.findByIdAndDelete(id);

  await logAudit({
    actorAdminId,
    action: "DELETE_TAG",
    targetType: "Tag",
    targetId: id,
    metadata: {
      detachedUsers: detachResult.modifiedCount,
      deletedUpstreams: deletedUpstreams.deletedCount,
      deletedStaticNodes: deletedStaticNodes.deletedCount,
    },
  });

  return {
    success: true,
    detachedUsers: detachResult.modifiedCount,
    deletedUpstreams: deletedUpstreams.deletedCount,
    deletedStaticNodes: deletedStaticNodes.deletedCount,
  };
};

const runAction = async (
  actorAdminId: string,
  tagId: string,
  input: TagBulkActionBody,
) => {
  await ensureTagExists(tagId);

  const users = await User.find({ tagIds: tagId }).select("_id");
  const userIds = users.map((user) => String(user._id));
  const matchedUsers = userIds.length;

  let affectedUsers = 0;

  if (input.action === "DEACTIVATE_USERS") {
    affectedUsers = await userService.deactivateByIds(userIds);
  } else if (input.action === "DELETE_USERS") {
    affectedUsers = await userService.deleteCascadeByIds(userIds);
  } else {
    affectedUsers = await userService.rotateTokensByIds(userIds);
  }

  await logAudit({
    actorAdminId,
    action: "TAG_BULK_ACTION",
    targetType: "Tag",
    targetId: tagId,
    metadata: {
      action: input.action,
      matchedUsers,
      affectedUsers,
    },
  });

  return {
    success: true,
    action: input.action,
    matchedUsers,
    affectedUsers,
  };
};

const applyToUsers = async (
  actorAdminId: string,
  tagId: string,
  input: TagApplyBody,
) => {
  await ensureTagExists(tagId);

  let targetUserIds: string[] = [];

  if (input.mode === "ALL") {
    const allUsers = await User.find().select("_id");
    targetUserIds = allUsers.map((user) => String(user._id));
  } else {
    const uniqueRequestedIds = [...new Set(input.userIds || [])];
    const existingUsers = await User.find({
      _id: { $in: uniqueRequestedIds },
    }).select("_id");
    targetUserIds = existingUsers.map((user) => String(user._id));
  }

  if (!targetUserIds.length) {
    return {
      success: true,
      mode: input.mode,
      matchedUsers: 0,
      affectedUsers: 0,
    };
  }

  const updateResult = await User.updateMany(
    {
      _id: { $in: targetUserIds },
      tagIds: { $ne: tagId },
    },
    {
      $addToSet: { tagIds: tagId },
    },
  );

  await cacheService.invalidateUsersCache(targetUserIds);

  const affectedUsers = updateResult.modifiedCount;
  const matchedUsers = targetUserIds.length;

  await logAudit({
    actorAdminId,
    action: "APPLY_TAG_TO_USERS",
    targetType: "Tag",
    targetId: tagId,
    metadata: {
      mode: input.mode,
      matchedUsers,
      affectedUsers,
    },
  });

  return {
    success: true,
    mode: input.mode,
    matchedUsers,
    affectedUsers,
  };
};

export const tagService = {
  list,
  getById,
  create,
  update,
  remove,
  runAction,
  applyToUsers,
};
