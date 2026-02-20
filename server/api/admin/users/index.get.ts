import { userService } from "~/server/utils/services/user-service";
import { parseQueryParams } from "~/server/utils/validation/parse";
import { listUsersQuerySchema } from "~/server/utils/validation/schemas/users";

export default defineEventHandler(async (event) => {
  const query = parseQueryParams(event, listUsersQuerySchema);
  return userService.list(query);
});
