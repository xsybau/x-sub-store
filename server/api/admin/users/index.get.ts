import { userService } from "~/server/utils/services/user-service";

export default defineEventHandler(async () => {
  return userService.list();
});
