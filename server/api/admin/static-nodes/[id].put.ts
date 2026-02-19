import { StaticNode } from '~/server/models/StaticNode';
import { logAudit } from '~/server/utils/audit';
import { CacheEntry } from '~/server/models/CacheEntry';

export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id');
    const body = await readBody(event);

    const node = await StaticNode.findByIdAndUpdate(id, body, { new: true });
    if (!node) throw createError({ statusCode: 404 });

    if (node.userId) {
        await CacheEntry.deleteMany({ userId: node.userId });
    } else {
        await CacheEntry.deleteMany({});
    }

    await logAudit({
        actorAdminId: event.context.user.id,
        action: 'UPDATE_STATIC_NODE',
        targetType: 'StaticNode',
        targetId: id
    });

    return node;
});
