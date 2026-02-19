import { Admin } from '~/server/models/Admin';
import {
  clearAdminAuthCookies,
  getRefreshTokenPayload,
  issueAdminTokens,
  revokeRefreshTokenById,
  validateRefreshTokenRecord
} from '~/server/utils/admin-auth';

export default defineEventHandler(async (event) => {
  const refreshPayload = getRefreshTokenPayload(event);
  if (!refreshPayload) {
    clearAdminAuthCookies(event);
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
  }

  try {
    await validateRefreshTokenRecord(refreshPayload);

    const admin = await Admin.findById(refreshPayload.sub).select('_id email role isActive');
    if (!admin || !admin.isActive) {
      await revokeRefreshTokenById(refreshPayload.jti);
      clearAdminAuthCookies(event);
      throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
    }

    await issueAdminTokens(
      event,
      {
        _id: String(admin._id),
        email: admin.email,
        role: admin.role
      },
      refreshPayload.jti
    );

    return { success: true };
  } catch (error) {
    clearAdminAuthCookies(event);
    throw error;
  }
});
