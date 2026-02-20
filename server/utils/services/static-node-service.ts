import { StaticNode } from "~/server/models/StaticNode";
import { logAudit } from "~/server/utils/audit";
import { cacheService } from "~/server/utils/services/cache-service";
import type {
  CreateStaticNodeBody,
  ListStaticNodesQuery,
  UpdateStaticNodeBody,
} from "~/server/utils/validation/schemas/static-nodes";

const list = async (query: ListStaticNodesQuery) => {
  const filter: {
    userId?: string;
    tagId?: string;
    scope?: "GLOBAL" | "USER" | "TAG";
  } = {};

  if (query.userId) {
    filter.userId = query.userId;
  }
  if (query.tagId) {
    filter.tagId = query.tagId;
  }
  if (query.scope) {
    filter.scope = query.scope;
  }

  return StaticNode.find(filter).sort({ createdAt: -1 });
};

const create = async (actorAdminId: string, input: CreateStaticNodeBody) => {
  const node = await StaticNode.create(input);

  await cacheService.invalidateBySourceTarget({
    scope: node.scope,
    userId: node.userId ? String(node.userId) : null,
    tagId: node.tagId ? String(node.tagId) : null,
  });

  await logAudit({
    actorAdminId,
    action: "CREATE_STATIC_NODE",
    targetType: "StaticNode",
    targetId: String(node._id),
    metadata: {
      name: input.name,
      scope: input.scope,
      userId: input.userId,
      tagId: input.tagId,
    },
  });

  return node;
};

const update = async (
  actorAdminId: string,
  id: string,
  input: UpdateStaticNodeBody,
) => {
  const node = await StaticNode.findByIdAndUpdate(id, input, {
    returnDocument: "after",
  });
  if (!node) {
    throw createError({
      statusCode: 404,
      statusMessage: "Static node not found",
    });
  }

  await cacheService.invalidateBySourceTarget({
    scope: node.scope,
    userId: node.userId ? String(node.userId) : null,
    tagId: node.tagId ? String(node.tagId) : null,
  });

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

  await cacheService.invalidateBySourceTarget({
    scope: node.scope,
    userId: node.userId ? String(node.userId) : null,
    tagId: node.tagId ? String(node.tagId) : null,
  });

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
