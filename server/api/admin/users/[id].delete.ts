import { requireActorAdminId } from "~/server/utils/services/types";
import { userService } from "~/server/utils/services/user-service";
import { parseRouteParams } from "~/server/utils/validation/parse";
import { userIdParamsSchema } from "~/server/utils/validation/schemas/users";

export default defineEventHandler(async (event) => {
  const actorAdminId = requireActorAdminId(event);
  const params = parseRouteParams(event, userIdParamsSchema);
  return userService.deleteCascade(actorAdminId, params.id);
});
