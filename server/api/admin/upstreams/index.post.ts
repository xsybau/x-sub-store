import { Upstream } from '~/server/models/Upstream';
import { logAudit } from '~/server/utils/audit';

export default defineEventHandler(async (event) => {
    const body = await readBody(event);

    // Validate scope and userId
    if (body.scope === 'USER' && !body.userId) {
        throw createError({ statusCode: 400, statusMessage: 'UserId required for USER scope' });
    }

    const upstream = await Upstream.create(body);

    await logAudit({
        actorAdminId: event.context.user.id,
        action: 'CREATE_UPSTREAM',
        targetType: 'Upstream',
        targetId: String(upstream._id),
        metadata: { name: body.name, scope: body.scope, url: body.url }
    });

    return upstream;
});
