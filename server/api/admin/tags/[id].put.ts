import { requireActorAdminId } from "~/server/utils/services/types";
import { tagService } from "~/server/utils/services/tag-service";
import { parseBody, parseRouteParams } from "~/server/utils/validation/parse";
import {
  tagIdParamsSchema,
  updateTagBodySchema,
} from "~/server/utils/validation/schemas/tags";

export default defineEventHandler(async (event) => {
  const actorAdminId = requireActorAdminId(event);
  const params = parseRouteParams(event, tagIdParamsSchema);
  const body = await parseBody(event, updateTagBodySchema);
  return tagService.update(actorAdminId, params.id, body);
});
