import { Admin } from '~/server/models/Admin';
import { verifyPassword } from '~/server/utils/password';
import { clearAdminAuthCookies, issueAdminTokens } from '~/server/utils/admin-auth';

export default defineEventHandler(async (event) => {
    const body = await readBody(event);
    const { email, password } = body;

    if (!email || !password) {
        throw createError({ statusCode: 400, statusMessage: 'Email and password are required' });
    }

    const admin = await Admin.findOne({ email });
    if (!admin) {
        // Use verifyPassword with dummy hash to prevent timing attacks?
        // Or just delay. For now, simple fail.
        throw createError({ statusCode: 401, statusMessage: 'Invalid credentials' });
    }

    const isValid = await verifyPassword(admin.passwordHash, password);
    if (!isValid) {
        throw createError({ statusCode: 401, statusMessage: 'Invalid credentials' });
    }

    if (!admin.isActive) {
        throw createError({ statusCode: 403, statusMessage: 'Admin inactive' });
    }

    // Defensive cleanup to avoid stale cookies from older auth versions.
    clearAdminAuthCookies(event);

    await issueAdminTokens(event, {
        _id: String(admin._id),
        email: admin.email,
        role: admin.role
    });

    return { success: true };
});
