import { Upstream } from '~/server/models/Upstream';
import { logAudit } from '~/server/utils/audit';
import { CacheEntry } from '~/server/models/CacheEntry';

export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id');

    const upstream = await Upstream.findByIdAndDelete(id);
    if (!upstream) throw createError({ statusCode: 404 });

    if (upstream.userId) {
        await CacheEntry.deleteMany({ userId: upstream.userId });
    } else {
        await CacheEntry.deleteMany({});
    }

    await logAudit({
        actorAdminId: event.context.user.id,
        action: 'DELETE_UPSTREAM',
        targetType: 'Upstream',
        targetId: id
    });

    return { success: true };
});
