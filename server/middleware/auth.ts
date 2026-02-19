import { getAdminUserFromAccessToken } from '~/server/utils/admin-auth';

export default defineEventHandler(async (event) => {
    // Only protect /api/admin/** routes, excluding /api/admin/auth/**
    if (event.path.startsWith('/api/admin') && !event.path.startsWith('/api/admin/auth')) {
        const user = getAdminUserFromAccessToken(event);
        if (!user) {
            throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
        }
        // Attach user to event context for easier access
        event.context.user = user;
    }
});
