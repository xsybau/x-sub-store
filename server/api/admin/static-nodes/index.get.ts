import { StaticNode } from '~/server/models/StaticNode';

export default defineEventHandler(async (event) => {
    const query = getQuery(event);
    const filter: any = {};
    if (query.userId) filter.userId = query.userId;
    if (query.scope) filter.scope = query.scope;
    return await StaticNode.find(filter).sort({ createdAt: -1 });
});
