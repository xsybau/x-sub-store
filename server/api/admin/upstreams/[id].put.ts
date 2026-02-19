import { Upstream } from '~/server/models/Upstream';
import { logAudit } from '~/server/utils/audit';
import { CacheEntry } from '~/server/models/CacheEntry';

export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id');
    const body = await readBody(event);

    const upstream = await Upstream.findByIdAndUpdate(id, body, { new: true });
    if (!upstream) throw createError({ statusCode: 404 });

    if (upstream.userId) {
        await CacheEntry.deleteMany({ userId: upstream.userId });
    } else {
        await CacheEntry.deleteMany({});
    }

    await logAudit({
        actorAdminId: event.context.user.id,
        action: 'UPDATE_UPSTREAM',
        targetType: 'Upstream',
        targetId: id,
        metadata: body
    });

    return upstream;
});
