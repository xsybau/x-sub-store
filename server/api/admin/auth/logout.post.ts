import {
  clearAdminAuthCookies,
  getAccessTokenPayload,
  revokeRefreshTokenById,
} from "~/server/utils/admin-auth";

export default defineEventHandler(async (event) => {
  const accessPayload = getAccessTokenPayload(event, {
    ignoreExpiration: true,
  });
  if (accessPayload?.rjti) {
    await revokeRefreshTokenById(accessPayload.rjti);
  }

  clearAdminAuthCookies(event);
  return { success: true };
});
