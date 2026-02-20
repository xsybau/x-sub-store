import { requireActorAdminId } from "~/server/utils/services/types";
import { upstreamService } from "~/server/utils/services/upstream-service";
import { parseRouteParams } from "~/server/utils/validation/parse";
import { upstreamIdParamsSchema } from "~/server/utils/validation/schemas/upstreams";

export default defineEventHandler(async (event) => {
  const actorAdminId = requireActorAdminId(event);
  const params = parseRouteParams(event, upstreamIdParamsSchema);
  return upstreamService.remove(actorAdminId, params.id);
});
