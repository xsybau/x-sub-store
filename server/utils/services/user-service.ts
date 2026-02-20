import { randomBytes } from "node:crypto";
import { CacheEntry } from "~/server/models/CacheEntry";
import { StaticNode } from "~/server/models/StaticNode";
import { Upstream } from "~/server/models/Upstream";
import { User } from "~/server/models/User";
import { UserToken } from "~/server/models/UserToken";
import { logAudit } from "~/server/utils/audit";
import {
  decryptToken,
  encryptToken,
  hashToken,
} from "~/server/utils/encryption";
import type {
  CreateUserBody,
  UpdateUserBody,
} from "~/server/utils/validation/schemas/users";

const list = async () => {
  return User.find().sort({ createdAt: -1 });
};

const createWithToken = async (actorAdminId: string, input: CreateUserBody) => {
  const existing = await User.findOne({ label: input.label });
  if (existing) {
    throw createError({
      statusCode: 400,
      statusMessage: "Label already exists",
    });
  }

  const user = await User.create({
    label: input.label,
    email: input.email,
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
    metadata: { label: user.label },
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

  const user = await User.findByIdAndUpdate(id, updatePayload, {
    new: true,
  });

  if (!user) {
    throw createError({ statusCode: 404, statusMessage: "User not found" });
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

const deleteCascade = async (actorAdminId: string, id: string) => {
  const user = await User.findByIdAndDelete(id);
  if (!user) {
    throw createError({ statusCode: 404, statusMessage: "User not found" });
  }

  await Promise.all([
    UserToken.deleteMany({ userId: id }),
    Upstream.deleteMany({ userId: id }),
    StaticNode.deleteMany({ userId: id }),
    CacheEntry.deleteMany({ userId: id }),
  ]);

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

  await CacheEntry.deleteMany({ userId: id });

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
};
