import { getAdminUserFromAccessToken } from "~/server/utils/admin-auth";

export default defineEventHandler(async (event) => {
  const user = event.context.user || getAdminUserFromAccessToken(event);
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
  }
  return { user };
});
