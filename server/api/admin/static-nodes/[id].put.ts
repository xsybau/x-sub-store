import { requireActorAdminId } from "~/server/utils/services/types";
import { staticNodeService } from "~/server/utils/services/static-node-service";
import { parseBody, parseRouteParams } from "~/server/utils/validation/parse";
import {
  staticNodeIdParamsSchema,
  updateStaticNodeBodySchema,
} from "~/server/utils/validation/schemas/static-nodes";

export default defineEventHandler(async (event) => {
  const actorAdminId = requireActorAdminId(event);
  const params = parseRouteParams(event, staticNodeIdParamsSchema);
  const body = await parseBody(event, updateStaticNodeBodySchema);
  return staticNodeService.update(actorAdminId, params.id, body);
});
