import { UserToken } from '~/server/models/UserToken';
import { User } from '~/server/models/User';
import { Upstream } from '~/server/models/Upstream';
import { StaticNode } from '~/server/models/StaticNode';
import { CacheEntry } from '~/server/models/CacheEntry';
import { hashToken } from '~/server/utils/encryption';
import { safeFetch } from '~/server/utils/fetcher';
import { extractNodes } from '~/server/utils/parser';
import { deduplicateNodes } from '~/server/utils/deduplicator';
import { Buffer } from 'node:buffer';

export default defineEventHandler(async (event) => {
    setResponseHeader(event, 'Content-Type', 'text/plain; charset=utf-8');

    const token = getRouterParam(event, 'token');
    if (!token) {
        throw createError({ statusCode: 400, statusMessage: 'Token required' });
    }

    // 1. Validate Token
    const hashed = hashToken(token);
    const tokenRecord = await UserToken.findOne({ tokenHash: hashed });

    if (!tokenRecord) {
        // Slow down timing attacks?
        await new Promise(r => setTimeout(r, 100 + Math.random() * 100));
        throw createError({ statusCode: 404, statusMessage: 'Not Found' });
    }

    if (tokenRecord.revokedAt) {
        throw createError({ statusCode: 403, statusMessage: 'Token Revoked' });
    }

    // 2. Check User Status
    const user = await User.findById(tokenRecord.userId);
    if (!user || !user.isActive) {
        throw createError({ statusCode: 403, statusMessage: 'User Inactive' });
    }

    // 3. Check Cache
    const cached = await CacheEntry.findOne({ userId: user._id });
    if (cached) {
        // Handle ETag
        const ifNoneMatch = getRequestHeader(event, 'If-None-Match');
        if (ifNoneMatch === cached.etag) {
            setResponseStatus(event, 304);
            return;
        }

        // Return cached
        setResponseHeader(event, 'ETag', cached.etag);
        return cached.contentBase64; // It is already base64 string
    }

    // 4. Fetch Sources
    const [userUpstreams, globalUpstreams, userStatic, globalStatic] = await Promise.all([
        Upstream.find({ userId: user._id, enabled: true }),
        Upstream.find({ scope: 'GLOBAL', enabled: true }),
        StaticNode.find({ userId: user._id, enabled: true }),
        StaticNode.find({ scope: 'GLOBAL', enabled: true })
    ]);

    // Fetch Upstreams content
    // We want to track errors per upstream but not fail the whole request
    const fetchPromises = [...userUpstreams, ...globalUpstreams].map(async (u) => {
        try {
            const content = await safeFetch(u.url);
            // Update status
            await Upstream.findByIdAndUpdate(u._id, {
                lastFetchStatus: 200,
                lastFetchAt: new Date(),
                lastError: null
            });
            return {
                content,
                priority: u.scope === 'USER' ? 2 : 1, // User scope has higher priority
                source: u.name
            };
        } catch (e: any) {
            await Upstream.findByIdAndUpdate(u._id, {
                lastFetchStatus: 0,
                lastFetchAt: new Date(),
                lastError: e.message
            });
            return null;
        }
    });

    const upstreamResults = await Promise.all(fetchPromises);

    // Process Nodes
    let allNodes: { uri: string, priority: number, source: string }[] = [];

    // Add static nodes
    userStatic.forEach(n => {
        const uris = extractNodes(n.content);
        uris.forEach(uri => allNodes.push({ uri, priority: 3, source: 'Static User' })); // Highest priority
    });

    globalStatic.forEach(n => {
        const uris = extractNodes(n.content);
        uris.forEach(uri => allNodes.push({ uri, priority: 1, source: 'Static Global' })); // Lowest priority
    });

    // Add fetched nodes
    upstreamResults.forEach(res => {
        if (res) {
            const uris = extractNodes(res.content);
            uris.forEach(uri => allNodes.push({ uri, priority: res.priority, source: res.source || 'Upstream' }));
        }
    });

    // Deduplicate
    const uniqueUris = deduplicateNodes(allNodes);

    // Encode
    const resultString = uniqueUris.join('\n');
    const resultBase64 = Buffer.from(resultString).toString('base64');

    // Cache
    const etag = `W/"${Buffer.byteLength(resultBase64).toString(16)}-${Date.now().toString(16)}"`;
    const config = useRuntimeConfig();
    const ttl = config.cacheTtlSeconds || 300;

    // Upsert cache
    await CacheEntry.findOneAndUpdate(
        { userId: user._id },
        {
            contentBase64: resultBase64,
            etag,
            expiresAt: new Date(Date.now() + ttl * 1000)
        },
        { upsert: true }
    );

    // Update lastUsedAt
    await UserToken.findByIdAndUpdate(tokenRecord._id, { lastUsedAt: new Date() });

    setResponseHeader(event, 'ETag', etag);
    return resultBase64;
});
