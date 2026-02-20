import { requireActorAdminId } from "~/server/utils/services/types";
import { tagService } from "~/server/utils/services/tag-service";
import { parseBody } from "~/server/utils/validation/parse";
import { createTagBodySchema } from "~/server/utils/validation/schemas/tags";

export default defineEventHandler(async (event) => {
  const actorAdminId = requireActorAdminId(event);
  const body = await parseBody(event, createTagBodySchema);
  return tagService.create(actorAdminId, body);
});
