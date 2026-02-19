import { User } from '~/server/models/User';
import { Upstream } from '~/server/models/Upstream';
import { StaticNode } from '~/server/models/StaticNode';
import { safeFetch } from '~/server/utils/fetcher';
import { extractNodes } from '~/server/utils/parser';
import { deduplicateNodes } from '~/server/utils/deduplicator';

export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id');
    const user = await User.findById(id);
    if (!user) throw createError({ statusCode: 404 });

    // Fetch Sources
    const [userUpstreams, globalUpstreams, userStatic, globalStatic] = await Promise.all([
        Upstream.find({ userId: user._id, enabled: true }),
        Upstream.find({ scope: 'GLOBAL', enabled: true }),
        StaticNode.find({ userId: user._id, enabled: true }),
        StaticNode.find({ scope: 'GLOBAL', enabled: true })
    ]);

    const fetchPromises = [...userUpstreams, ...globalUpstreams].map(async (u) => {
        try {
            const content = await safeFetch(u.url);
            return {
                content,
                priority: u.scope === 'USER' ? 2 : 1,
                source: u.name,
                status: 'OK'
            };
        } catch (e: any) {
            return {
                content: '',
                priority: u.scope === 'USER' ? 2 : 1,
                source: u.name,
                status: 'ERROR',
                error: e.message
            };
        }
    });

    const upstreamResults = await Promise.all(fetchPromises);

    let allNodes: any[] = [];

    userStatic.forEach(n => {
        const uris = extractNodes(n.content);
        uris.forEach(uri => allNodes.push({ uri, priority: 3, source: `Static User: ${n.name}` }));
    });

    globalStatic.forEach(n => {
        const uris = extractNodes(n.content);
        uris.forEach(uri => allNodes.push({ uri, priority: 1, source: `Static Global: ${n.name}` }));
    });

    upstreamResults.forEach(res => {
        if (res.status === 'OK') {
            const uris = extractNodes(res.content);
            uris.forEach(uri => allNodes.push({ uri, priority: res.priority, source: res.source }));
        }
    });

    const uniqueUris = deduplicateNodes(allNodes);

    return {
        user,
        stats: {
            upstreams: upstreamResults.length,
            staticNodes: userStatic.length + globalStatic.length,
            totalRawNodes: allNodes.length,
            uniqueNodes: uniqueUris.length
        },
        nodes: uniqueUris,
        upstreamStatus: upstreamResults.map(r => ({ source: r.source, status: r.status, error: r.error }))
    };
});
