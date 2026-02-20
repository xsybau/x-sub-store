import type {
  TagApplyMode,
  TagApplyResult,
  CreateTagInput,
  DeleteTagResult,
  TagBulkAction,
  TagBulkActionResult,
  TagItem,
  UpdateTagInput,
} from "~/modules/AdminUsers/types/tags";

export const listTagsApi = async (
  headers?: HeadersInit,
): Promise<TagItem[]> => {
  return $fetch("/api/admin/tags", { headers });
};

export const createTagApi = async (input: CreateTagInput): Promise<TagItem> => {
  return $fetch("/api/admin/tags", {
    method: "POST",
    body: input,
  });
};

export const getTagApi = async (id: string): Promise<TagItem> => {
  return $fetch(`/api/admin/tags/${id}`);
};

export const updateTagApi = async (
  id: string,
  input: UpdateTagInput,
): Promise<TagItem> => {
  return $fetch(`/api/admin/tags/${id}`, {
    method: "PUT",
    body: input,
  });
};

export const deleteTagApi = async (id: string): Promise<DeleteTagResult> => {
  return $fetch(`/api/admin/tags/${id}`, {
    method: "DELETE",
  });
};

export const runTagActionApi = async (
  id: string,
  action: TagBulkAction,
): Promise<TagBulkActionResult> => {
  return $fetch(`/api/admin/tags/${id}/actions`, {
    method: "POST",
    body: { action },
  });
};

export const applyTagToUsersApi = async (
  id: string,
  input: {
    mode: TagApplyMode;
    userIds?: string[];
  },
): Promise<TagApplyResult> => {
  return $fetch(`/api/admin/tags/${id}/apply`, {
    method: "POST",
    body: input,
  });
};
