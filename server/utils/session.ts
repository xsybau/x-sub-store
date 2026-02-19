import { type H3Event, useSession } from 'h3';
import { createHmac } from 'node:crypto';

const getSessionPassword = () => {
    const config = useRuntimeConfig();
    const secret =
      config.adminSessionSecret ||
      process.env.ADMIN_SESSION_SECRET ||
      config.appSecret ||
      process.env.APP_SECRET;
    if (!secret) throw new Error('ADMIN_SESSION_SECRET or APP_SECRET is not set');
    // Ensure 32 chars min for sealed sessions
    if (secret.length < 32) {
       return createHmac('sha256', secret).update('session-secret-key').digest('hex');
    }
    return secret;
};

export const useAdminSession = async (event: H3Event) => {
    const password = getSessionPassword();

    return await useSession(event, {
        name: 'admin_session',
        password,
        maxAge: 60 * 60 * 24 * 7, // 1 week
        cookie: {
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
            httpOnly: true
        }
    });
};
