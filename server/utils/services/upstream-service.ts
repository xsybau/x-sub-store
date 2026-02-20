import { CacheEntry } from "~/server/models/CacheEntry";
import { Upstream } from "~/server/models/Upstream";
import { logAudit } from "~/server/utils/audit";
import { safeFetch } from "~/server/utils/fetcher";
import {
  getErrorMessage,
  type TestFetchResult,
} from "~/server/utils/services/types";
import type {
  CreateUpstreamBody,
  ListUpstreamsQuery,
  UpdateUpstreamBody,
} from "~/server/utils/validation/schemas/upstreams";

const invalidateCacheByScope = async (userId?: string | null) => {
  if (userId) {
    await CacheEntry.deleteMany({ userId });
    return;
  }
  await CacheEntry.deleteMany({});
};

const list = async (query: ListUpstreamsQuery) => {
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

  return Upstream.find(filter).sort({ createdAt: -1 });
};

const create = async (actorAdminId: string, input: CreateUpstreamBody) => {
  const upstream = await Upstream.create(input);

  await logAudit({
    actorAdminId,
    action: "CREATE_UPSTREAM",
    targetType: "Upstream",
    targetId: String(upstream._id),
    metadata: {
      name: input.name,
      scope: input.scope,
      url: input.url,
    },
  });

  return upstream;
};

const update = async (
  actorAdminId: string,
  id: string,
  input: UpdateUpstreamBody,
) => {
  const upstream = await Upstream.findByIdAndUpdate(id, input, { new: true });
  if (!upstream) {
    throw createError({ statusCode: 404, statusMessage: "Upstream not found" });
  }

  await invalidateCacheByScope(
    upstream.userId ? String(upstream.userId) : null,
  );

  await logAudit({
    actorAdminId,
    action: "UPDATE_UPSTREAM",
    targetType: "Upstream",
    targetId: id,
    metadata: input,
  });

  return upstream;
};

const remove = async (actorAdminId: string, id: string) => {
  const upstream = await Upstream.findByIdAndDelete(id);
  if (!upstream) {
    throw createError({ statusCode: 404, statusMessage: "Upstream not found" });
  }

  await invalidateCacheByScope(
    upstream.userId ? String(upstream.userId) : null,
  );

  await logAudit({
    actorAdminId,
    action: "DELETE_UPSTREAM",
    targetType: "Upstream",
    targetId: id,
  });

  return { success: true };
};

const testFetch = async (url: string): Promise<TestFetchResult> => {
  const start = Date.now();

  try {
    const content = await safeFetch(url);
    const duration = Date.now() - start;

    return {
      success: true,
      status: 200,
      duration,
      size: content.length,
      preview: content.substring(0, 200) + (content.length > 200 ? "..." : ""),
    };
  } catch (error) {
    return {
      success: false,
      duration: Date.now() - start,
      error: getErrorMessage(error),
    };
  }
};

export const upstreamService = {
  list,
  create,
  update,
  remove,
  testFetch,
};
