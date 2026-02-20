import { requireActorAdminId } from "~/server/utils/services/types";
import { userService } from "~/server/utils/services/user-service";
import { parseBody, parseRouteParams } from "~/server/utils/validation/parse";
import {
  updateUserBodySchema,
  userIdParamsSchema,
} from "~/server/utils/validation/schemas/users";

export default defineEventHandler(async (event) => {
  const actorAdminId = requireActorAdminId(event);
  const params = parseRouteParams(event, userIdParamsSchema);
  const body = await parseBody(event, updateUserBodySchema);
  return userService.update(actorAdminId, params.id, body);
});
