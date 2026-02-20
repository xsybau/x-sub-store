export type SourceScope = "GLOBAL" | "USER";

export interface UpstreamItem {
  _id: string;
  name: string;
  url: string;
  scope: SourceScope;
  userId?: string;
  enabled?: boolean;
  type?: string;
  lastFetchStatus?: number;
  lastFetchAt?: string;
  lastError?: string;
}

export interface StaticNodeItem {
  _id: string;
  name: string;
  content: string;
  scope: SourceScope;
  userId?: string;
  enabled?: boolean;
}

export interface CreateUpstreamInput {
  name: string;
  url: string;
  scope: SourceScope;
  userId?: string;
}

export interface UpdateUpstreamInput {
  name?: string;
  url?: string;
  enabled?: boolean;
  type?: string;
}

export interface CreateStaticNodeInput {
  name: string;
  content: string;
  scope: SourceScope;
  userId?: string;
}

export interface UpdateStaticNodeInput {
  name?: string;
  content?: string;
  enabled?: boolean;
}

export interface TestFetchResult {
  success: boolean;
  status?: number;
  duration: number;
  size?: number;
  preview?: string;
  error?: string;
}
