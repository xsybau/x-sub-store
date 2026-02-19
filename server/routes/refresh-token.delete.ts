import {
  clearAdminAuthCookies,
  getAccessTokenPayload,
  getRefreshTokenPayload,
  revokeRefreshTokenById,
} from "~/server/utils/admin-auth";

export default defineEventHandler(async (event) => {
  const refreshPayload = getRefreshTokenPayload(event, {
    ignoreExpiration: true,
  });
  if (refreshPayload?.jti) {
    await revokeRefreshTokenById(refreshPayload.jti);
  } else {
    // Fallback: revoke using access payload reference if refresh cookie is not available.
    const accessPayload = getAccessTokenPayload(event, {
      ignoreExpiration: true,
    });
    if (accessPayload?.rjti) {
      await revokeRefreshTokenById(accessPayload.rjti);
    }
  }

  clearAdminAuthCookies(event);
  return { success: true };
});
