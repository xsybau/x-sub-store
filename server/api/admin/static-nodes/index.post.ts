import { requireActorAdminId } from "~/server/utils/services/types";
import { staticNodeService } from "~/server/utils/services/static-node-service";
import { parseBody } from "~/server/utils/validation/parse";
import { createStaticNodeBodySchema } from "~/server/utils/validation/schemas/static-nodes";

export default defineEventHandler(async (event) => {
  const actorAdminId = requireActorAdminId(event);
  const body = await parseBody(event, createStaticNodeBodySchema);
  return staticNodeService.create(actorAdminId, body);
});
