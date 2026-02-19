import { User } from '~/server/models/User';
import { logAudit } from '~/server/utils/audit';

export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id');
    const body = await readBody(event);

    const user = await User.findByIdAndUpdate(id, body, { new: true });
    if (!user) {
        throw createError({ statusCode: 404 });
    }

    await logAudit({
        actorAdminId: event.context.user.id,
        action: 'UPDATE_USER',
        targetType: 'User',
        targetId: id,
        metadata: body
    });

    return user;
});
