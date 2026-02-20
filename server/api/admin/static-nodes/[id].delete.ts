import { requireActorAdminId } from "~/server/utils/services/types";
import { staticNodeService } from "~/server/utils/services/static-node-service";
import { parseRouteParams } from "~/server/utils/validation/parse";
import { staticNodeIdParamsSchema } from "~/server/utils/validation/schemas/static-nodes";

export default defineEventHandler(async (event) => {
  const actorAdminId = requireActorAdminId(event);
  const params = parseRouteParams(event, staticNodeIdParamsSchema);
  return staticNodeService.remove(actorAdminId, params.id);
});
