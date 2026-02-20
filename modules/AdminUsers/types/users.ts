export interface UserItem {
  _id: string;
  label: string;
  email?: string;
  tagIds: string[];
  isActive: boolean;
}

export interface UserWithToken extends UserItem {
  token: string | null;
}

export interface CreateUserInput {
  label: string;
  email?: string;
  tagIds?: string[];
}

export interface UpdateUserInput {
  label?: string;
  email?: string;
  isActive?: boolean;
  tagIds?: string[];
}

export interface PreviewStats {
  upstreams: number;
  staticNodes: number;
  totalRawNodes: number;
  uniqueNodes: number;
}

export interface PreviewUpstreamStatus {
  source: string;
  status: "OK" | "ERROR";
  error?: string;
}

export interface UserSubscriptionPreview {
  user: UserItem;
  stats: PreviewStats;
  nodes: string[];
  upstreamStatus: PreviewUpstreamStatus[];
}

export interface CreateUserResponse {
  user: UserItem;
  token: string;
}
