import { createError, type H3Event } from "h3";

export type SourceScope = "GLOBAL" | "USER";

export interface NodeCandidate {
  uri: string;
  priority: number;
  source: string;
}

export interface UpstreamFetchResult {
  content: string;
  priority: number;
  source: string;
  status: "OK" | "ERROR";
  error?: string;
}

export interface PreviewStats {
  upstreams: number;
  staticNodes: number;
  totalRawNodes: number;
  uniqueNodes: number;
}

export interface PreviewResult {
  user: unknown;
  stats: PreviewStats;
  nodes: string[];
  upstreamStatus: Array<{
    source: string;
    status: "OK" | "ERROR";
    error?: string;
  }>;
}

export interface ResolveByTokenInput {
  token: string;
}

export interface ResolveByTokenResult {
  etag: string;
  contentBase64: string;
}

export interface TestFetchResult {
  success: boolean;
  status?: number;
  duration: number;
  size?: number;
  preview?: string;
  error?: string;
}

export const requireActorAdminId = (event: H3Event): string => {
  const user = event.context.user as { id?: string } | undefined;
  if (!user?.id) {
    throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
  }
  return user.id;
};

export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return "Unexpected error";
};
