export interface TagItem {
  _id: string;
  name: string;
  normalizedName: string;
  isDefault: boolean;
}

export interface CreateTagInput {
  name: string;
  isDefault?: boolean;
}

export interface UpdateTagInput {
  name?: string;
  isDefault?: boolean;
}

export type TagBulkAction =
  | "DEACTIVATE_USERS"
  | "DELETE_USERS"
  | "ROTATE_TOKENS";

export interface TagBulkActionResult {
  success: boolean;
  action: TagBulkAction;
  matchedUsers: number;
  affectedUsers: number;
}

export type TagApplyMode = "ALL" | "SELECTED";

export interface TagApplyResult {
  success: boolean;
  mode: TagApplyMode;
  matchedUsers: number;
  affectedUsers: number;
}

export interface DeleteTagResult {
  success: boolean;
  detachedUsers: number;
  deletedUpstreams: number;
  deletedStaticNodes: number;
}
