import { requireActorAdminId } from "~/server/utils/services/types";
import { userService } from "~/server/utils/services/user-service";
import { parseBody } from "~/server/utils/validation/parse";
import { createUserBodySchema } from "~/server/utils/validation/schemas/users";

export default defineEventHandler(async (event) => {
  const actorAdminId = requireActorAdminId(event);
  const body = await parseBody(event, createUserBodySchema);
  return userService.createWithToken(actorAdminId, body);
});
