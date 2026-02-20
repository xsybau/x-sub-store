import { requireActorAdminId } from "~/server/utils/services/types";
import { upstreamService } from "~/server/utils/services/upstream-service";
import { parseBody, parseRouteParams } from "~/server/utils/validation/parse";
import {
  updateUpstreamBodySchema,
  upstreamIdParamsSchema,
} from "~/server/utils/validation/schemas/upstreams";

export default defineEventHandler(async (event) => {
  const actorAdminId = requireActorAdminId(event);
  const params = parseRouteParams(event, upstreamIdParamsSchema);
  const body = await parseBody(event, updateUpstreamBodySchema);
  return upstreamService.update(actorAdminId, params.id, body);
});
