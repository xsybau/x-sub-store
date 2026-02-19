import { StaticNode } from '~/server/models/StaticNode';
import { logAudit } from '~/server/utils/audit';

export default defineEventHandler(async (event) => {
    const body = await readBody(event);
    if (body.scope === 'USER' && !body.userId) {
        throw createError({ statusCode: 400, statusMessage: 'User ID required for USER scope' });
    }

    const node = await StaticNode.create(body);

    await logAudit({
        actorAdminId: event.context.user.id,
        action: 'CREATE_STATIC_NODE',
        targetType: 'StaticNode',
        targetId: String(node._id),
        metadata: { name: body.name }
    });

    return node;
});
