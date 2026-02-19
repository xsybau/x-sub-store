import { Upstream } from '~/server/models/Upstream';

export default defineEventHandler(async (event) => {
    const query = getQuery(event);
    const filter: any = {};
    if (query.userId) {
        filter.userId = query.userId;
    }
    if (query.scope) {
        filter.scope = query.scope;
    }

    return await Upstream.find(filter).sort({ createdAt: -1 });
});
