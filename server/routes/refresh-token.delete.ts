import { authService } from "~/server/utils/services/auth-service";

export default defineEventHandler(async (event) => {
  return authService.revokeSession(event);
});
