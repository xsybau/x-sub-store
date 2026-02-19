import { User } from '~/server/models/User';
import { UserToken } from '~/server/models/UserToken';
import { Upstream } from '~/server/models/Upstream';
import { StaticNode } from '~/server/models/StaticNode';
import { CacheEntry } from '~/server/models/CacheEntry';
import { logAudit } from '~/server/utils/audit';

export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id');

    const user = await User.findByIdAndDelete(id);
    if (!user) {
        throw createError({ statusCode: 404 });
    }

    // Cleanup
    await UserToken.deleteMany({ userId: id });
    await Upstream.deleteMany({ userId: id });
    await StaticNode.deleteMany({ userId: id });
    await CacheEntry.deleteMany({ userId: id });

    await logAudit({
        actorAdminId: event.context.user.id,
        action: 'DELETE_USER',
        targetType: 'User',
        targetId: id
    });

    return { success: true };
});
