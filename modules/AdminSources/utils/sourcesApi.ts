import type {
  CreateStaticNodeInput,
  CreateUpstreamInput,
  SourceScope,
  StaticNodeItem,
  TestFetchResult,
  UpdateStaticNodeInput,
  UpdateUpstreamInput,
  UpstreamItem,
} from "~/modules/AdminSources/types/sources";

interface SourceListFilter {
  scope: SourceScope;
  userId?: string;
  tagId?: string;
}

const sourceQuery = (filter: SourceListFilter) => {
  return {
    scope: filter.scope,
    userId: filter.userId,
    tagId: filter.tagId,
  };
};

export const listUpstreamsApi = async (
  filter: SourceListFilter,
): Promise<UpstreamItem[]> => {
  return $fetch("/api/admin/upstreams", {
    query: sourceQuery(filter),
  });
};

export const createUpstreamApi = async (
  input: CreateUpstreamInput,
): Promise<UpstreamItem> => {
  return $fetch("/api/admin/upstreams", {
    method: "POST",
    body: input,
  });
};

export const updateUpstreamApi = async (
  id: string,
  input: UpdateUpstreamInput,
): Promise<UpstreamItem> => {
  return $fetch(`/api/admin/upstreams/${id}`, {
    method: "PUT",
    body: input,
  });
};

export const deleteUpstreamApi = async (
  id: string,
): Promise<{ success: boolean }> => {
  return $fetch(`/api/admin/upstreams/${id}`, {
    method: "DELETE",
  });
};

export const testUpstreamFetchApi = async (input: {
  url: string;
  upstreamId?: string;
}): Promise<TestFetchResult> => {
  return $fetch("/api/admin/test-fetch", {
    method: "POST",
    body: input,
  });
};

export const listStaticNodesApi = async (
  filter: SourceListFilter,
): Promise<StaticNodeItem[]> => {
  return $fetch("/api/admin/static-nodes", {
    query: sourceQuery(filter),
  });
};

export const createStaticNodeApi = async (
  input: CreateStaticNodeInput,
): Promise<StaticNodeItem> => {
  return $fetch("/api/admin/static-nodes", {
    method: "POST",
    body: input,
  });
};

export const updateStaticNodeApi = async (
  id: string,
  input: UpdateStaticNodeInput,
): Promise<StaticNodeItem> => {
  return $fetch(`/api/admin/static-nodes/${id}`, {
    method: "PUT",
    body: input,
  });
};

export const deleteStaticNodeApi = async (
  id: string,
): Promise<{ success: boolean }> => {
  return $fetch(`/api/admin/static-nodes/${id}`, {
    method: "DELETE",
  });
};
