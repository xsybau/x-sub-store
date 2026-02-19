import { StaticNode } from '~/server/models/StaticNode';
import { logAudit } from '~/server/utils/audit';
import { CacheEntry } from '~/server/models/CacheEntry';

export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id');

    const node = await StaticNode.findByIdAndDelete(id);
    if (!node) throw createError({ statusCode: 404 });

    if (node.userId) {
        await CacheEntry.deleteMany({ userId: node.userId });
    } else {
        await CacheEntry.deleteMany({});
    }

    await logAudit({
        actorAdminId: event.context.user.id,
        action: 'DELETE_STATIC_NODE',
        targetType: 'StaticNode',
        targetId: id
    });

    return { success: true };
});
