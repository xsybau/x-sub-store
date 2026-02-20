import { tagService } from "~/server/utils/services/tag-service";
import { parseRouteParams } from "~/server/utils/validation/parse";
import { tagIdParamsSchema } from "~/server/utils/validation/schemas/tags";

export default defineEventHandler(async (event) => {
  const params = parseRouteParams(event, tagIdParamsSchema);
  return tagService.getById(params.id);
});
