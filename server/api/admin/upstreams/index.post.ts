import { requireActorAdminId } from "~/server/utils/services/types";
import { upstreamService } from "~/server/utils/services/upstream-service";
import { parseBody } from "~/server/utils/validation/parse";
import { createUpstreamBodySchema } from "~/server/utils/validation/schemas/upstreams";

export default defineEventHandler(async (event) => {
  const actorAdminId = requireActorAdminId(event);
  const body = await parseBody(event, createUpstreamBodySchema);
  return upstreamService.create(actorAdminId, body);
});
