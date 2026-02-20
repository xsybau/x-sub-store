import { Buffer } from "node:buffer";
import { CacheEntry } from "~/server/models/CacheEntry";
import { StaticNode } from "~/server/models/StaticNode";
import { Upstream } from "~/server/models/Upstream";
import { User } from "~/server/models/User";
import { UserToken } from "~/server/models/UserToken";
import { deduplicateNodes } from "~/server/utils/deduplicator";
import { hashToken } from "~/server/utils/encryption";
import { safeFetch } from "~/server/utils/fetcher";
import { extractNodes } from "~/server/utils/parser";
import {
  getErrorMessage,
  type NodeCandidate,
  type PreviewResult,
  type ResolveByTokenInput,
  type ResolveByTokenResult,
  type SourceScope,
  type UpstreamFetchResult,
} from "~/server/utils/services/types";

const getPriorityForScope = (scope: SourceScope): number => {
  if (scope === "USER") {
    return 3;
  }

  if (scope === "TAG") {
    return 2;
  }

  return 1;
};

const getStaticPriorityForScope = (scope: SourceScope): number => {
  if (scope === "USER") {
    return 3;
  }

  if (scope === "TAG") {
    return 2;
  }

  return 1;
};

const getStaticSourcePrefix = (scope: SourceScope): string => {
  if (scope === "USER") {
    return "Static User";
  }

  if (scope === "TAG") {
    return "Static Tag";
  }

  return "Static Global";
};

const getUpstreamSourcePrefix = (scope: SourceScope): string => {
  if (scope === "USER") {
    return "User Upstream";
  }

  if (scope === "TAG") {
    return "Tag Upstream";
  }

  return "Global Upstream";
};

const listUserSources = async (user: { _id: unknown; tagIds?: unknown[] }) => {
  const userId = String(user._id);
  const tagIds = (user.tagIds || []).map((tagId) => String(tagId));

  const [
    userUpstreams,
    tagUpstreams,
    globalUpstreams,
    userStatic,
    tagStatic,
    globalStatic,
  ] = await Promise.all([
    Upstream.find({ userId, enabled: true }),
    Upstream.find({ scope: "TAG", tagId: { $in: tagIds }, enabled: true }),
    Upstream.find({ scope: "GLOBAL", enabled: true }),
    StaticNode.find({ userId, enabled: true }),
    StaticNode.find({ scope: "TAG", tagId: { $in: tagIds }, enabled: true }),
    StaticNode.find({ scope: "GLOBAL", enabled: true }),
  ]);

  return {
    userUpstreams,
    tagUpstreams,
    globalUpstreams,
    userStatic,
    tagStatic,
    globalStatic,
  };
};

const parseStaticNodes = (
  staticNodes: Array<{
    content: string;
    name?: string | null;
    scope: SourceScope;
  }>,
): NodeCandidate[] => {
  const allNodes: NodeCandidate[] = [];

  for (const node of staticNodes) {
    const uris = extractNodes(node.content);
    const priority = getStaticPriorityForScope(node.scope);
    const sourcePrefix = getStaticSourcePrefix(node.scope);
    const source = node.name ? `${sourcePrefix}: ${node.name}` : sourcePrefix;

    for (const uri of uris) {
      allNodes.push({
        uri,
        priority,
        source,
      });
    }
  }

  return allNodes;
};

const fetchUpstreamContents = async (
  upstreams: Array<{
    _id: unknown;
    scope: SourceScope;
    name: string;
    url: string;
  }>,
  options: {
    updateStatus: boolean;
  },
): Promise<UpstreamFetchResult[]> => {
  const results: UpstreamFetchResult[] = [];

  for (const upstream of upstreams) {
    const priority = getPriorityForScope(upstream.scope);
    const source = `${getUpstreamSourcePrefix(upstream.scope)}: ${upstream.name}`;

    try {
      const content = await safeFetch(upstream.url);

      if (options.updateStatus) {
        await Upstream.findByIdAndUpdate(upstream._id, {
          lastFetchStatus: 200,
          lastFetchAt: new Date(),
          lastError: null,
        });
      }

      results.push({
        content,
        priority,
        source,
        status: "OK",
      });
    } catch (error) {
      const errorMessage = getErrorMessage(error);

      if (options.updateStatus) {
        await Upstream.findByIdAndUpdate(upstream._id, {
          lastFetchStatus: 0,
          lastFetchAt: new Date(),
          lastError: errorMessage,
        });
      }

      results.push({
        content: "",
        priority,
        source,
        status: "ERROR",
        error: errorMessage,
      });
    }
  }

  return results;
};

const parseUpstreamNodes = (
  upstreamResults: UpstreamFetchResult[],
): NodeCandidate[] => {
  const allNodes: NodeCandidate[] = [];

  for (const result of upstreamResults) {
    if (result.status !== "OK") {
      continue;
    }

    const uris = extractNodes(result.content);
    for (const uri of uris) {
      allNodes.push({
        uri,
        priority: result.priority,
        source: result.source || "Upstream",
      });
    }
  }

  return allNodes;
};

const buildDeduplicatedNodes = (
  staticNodes: Array<{
    content: string;
    name?: string | null;
    scope: SourceScope;
  }>,
  upstreamResults: UpstreamFetchResult[],
) => {
  const allNodes: NodeCandidate[] = [
    ...parseStaticNodes(staticNodes),
    ...parseUpstreamNodes(upstreamResults),
  ];

  const uniqueUris = deduplicateNodes(allNodes);

  return {
    allNodes,
    uniqueUris,
  };
};

const previewForUser = async (id: string): Promise<PreviewResult> => {
  const user = await User.findById(id);
  if (!user) {
    throw createError({ statusCode: 404, statusMessage: "User not found" });
  }

  const {
    userUpstreams,
    tagUpstreams,
    globalUpstreams,
    userStatic,
    tagStatic,
    globalStatic,
  } = await listUserSources(user);

  const upstreamResults = await fetchUpstreamContents(
    [...userUpstreams, ...tagUpstreams, ...globalUpstreams].map((upstream) => ({
      _id: upstream._id,
      scope: upstream.scope,
      name: upstream.name,
      url: upstream.url,
    })),
    { updateStatus: false },
  );

  const { allNodes, uniqueUris } = buildDeduplicatedNodes(
    [
      ...userStatic.map((node) => ({
        content: node.content,
        name: node.name,
        scope: node.scope,
      })),
      ...tagStatic.map((node) => ({
        content: node.content,
        name: node.name,
        scope: node.scope,
      })),
      ...globalStatic.map((node) => ({
        content: node.content,
        name: node.name,
        scope: node.scope,
      })),
    ],
    upstreamResults,
  );

  return {
    user,
    stats: {
      upstreams: upstreamResults.length,
      staticNodes: userStatic.length + tagStatic.length + globalStatic.length,
      totalRawNodes: allNodes.length,
      uniqueNodes: uniqueUris.length,
    },
    nodes: uniqueUris,
    upstreamStatus: upstreamResults.map((result) => ({
      source: result.source,
      status: result.status,
      error: result.error,
    })),
  };
};

const resolveByToken = async (
  input: ResolveByTokenInput,
): Promise<ResolveByTokenResult> => {
  const hashed = hashToken(input.token);
  const tokenRecord = await UserToken.findOne({ tokenHash: hashed });

  if (!tokenRecord) {
    await new Promise((resolve) =>
      setTimeout(resolve, 100 + Math.random() * 100),
    );
    throw createError({ statusCode: 404, statusMessage: "Not Found" });
  }

  if (tokenRecord.revokedAt) {
    throw createError({ statusCode: 403, statusMessage: "Token Revoked" });
  }

  const user = await User.findById(tokenRecord.userId);
  if (!user || !user.isActive) {
    throw createError({ statusCode: 403, statusMessage: "User Inactive" });
  }

  const cached = await CacheEntry.findOne({ userId: user._id });
  if (cached) {
    return {
      etag: cached.etag,
      contentBase64: cached.contentBase64,
    };
  }

  const {
    userUpstreams,
    tagUpstreams,
    globalUpstreams,
    userStatic,
    tagStatic,
    globalStatic,
  } = await listUserSources(user);

  const upstreamResults = await fetchUpstreamContents(
    [...userUpstreams, ...tagUpstreams, ...globalUpstreams].map((upstream) => ({
      _id: upstream._id,
      scope: upstream.scope,
      name: upstream.name,
      url: upstream.url,
    })),
    { updateStatus: true },
  );

  const { uniqueUris } = buildDeduplicatedNodes(
    [
      ...userStatic.map((node) => ({
        content: node.content,
        name: node.name,
        scope: node.scope,
      })),
      ...tagStatic.map((node) => ({
        content: node.content,
        name: node.name,
        scope: node.scope,
      })),
      ...globalStatic.map((node) => ({
        content: node.content,
        name: node.name,
        scope: node.scope,
      })),
    ],
    upstreamResults,
  );

  const resultString = uniqueUris.join("\n");
  const resultBase64 = Buffer.from(resultString).toString("base64");

  const etag = `W/"${Buffer.byteLength(resultBase64).toString(16)}-${Date.now().toString(16)}"`;
  const config = useRuntimeConfig();
  const ttl = config.cacheTtlSeconds || 300;

  await CacheEntry.findOneAndUpdate(
    { userId: user._id },
    {
      contentBase64: resultBase64,
      etag,
      expiresAt: new Date(Date.now() + ttl * 1000),
    },
    { upsert: true },
  );

  await UserToken.findByIdAndUpdate(tokenRecord._id, {
    lastUsedAt: new Date(),
  });

  return { etag, contentBase64: resultBase64 };
};

export const subscriptionService = {
  previewForUser,
  resolveByToken,
};
