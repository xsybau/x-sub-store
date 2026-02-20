import { CacheEntry } from "~/server/models/CacheEntry";
import { StaticNode } from "~/server/models/StaticNode";
import { logAudit } from "~/server/utils/audit";
import type {
  CreateStaticNodeBody,
  ListStaticNodesQuery,
  UpdateStaticNodeBody,
} from "~/server/utils/validation/schemas/static-nodes";

const invalidateCacheByScope = async (userId?: string | null) => {
  if (userId) {
    await CacheEntry.deleteMany({ userId });
    return;
  }
  await CacheEntry.deleteMany({});
};

const list = async (query: ListStaticNodesQuery) => {
  const filter: {
    userId?: string;
    scope?: "GLOBAL" | "USER";
  } = {};

  if (query.userId) {
    filter.userId = query.userId;
  }
  if (query.scope) {
    filter.scope = query.scope;
  }

  return StaticNode.find(filter).sort({ createdAt: -1 });
};

const create = async (actorAdminId: string, input: CreateStaticNodeBody) => {
  const node = await StaticNode.create(input);

  await logAudit({
    actorAdminId,
    action: "CREATE_STATIC_NODE",
    targetType: "StaticNode",
    targetId: String(node._id),
    metadata: {
      name: input.name,
      scope: input.scope,
    },
  });

  return node;
};

const update = async (
  actorAdminId: string,
  id: string,
  input: UpdateStaticNodeBody,
) => {
  const node = await StaticNode.findByIdAndUpdate(id, input, { new: true });
  if (!node) {
    throw createError({
      statusCode: 404,
      statusMessage: "Static node not found",
    });
  }

  await invalidateCacheByScope(node.userId ? String(node.userId) : null);

  await logAudit({
    actorAdminId,
    action: "UPDATE_STATIC_NODE",
    targetType: "StaticNode",
    targetId: id,
    metadata: input,
  });

  return node;
};

const remove = async (actorAdminId: string, id: string) => {
  const node = await StaticNode.findByIdAndDelete(id);
  if (!node) {
    throw createError({
      statusCode: 404,
      statusMessage: "Static node not found",
    });
  }

  await invalidateCacheByScope(node.userId ? String(node.userId) : null);

  await logAudit({
    actorAdminId,
    action: "DELETE_STATIC_NODE",
    targetType: "StaticNode",
    targetId: id,
  });

  return { success: true };
};

export const staticNodeService = {
  list,
  create,
  update,
  remove,
};
