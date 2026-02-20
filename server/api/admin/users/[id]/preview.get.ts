import { subscriptionService } from "~/server/utils/services/subscription-service";
import { parseRouteParams } from "~/server/utils/validation/parse";
import { userIdParamsSchema } from "~/server/utils/validation/schemas/users";

export default defineEventHandler(async (event) => {
  const params = parseRouteParams(event, userIdParamsSchema);
  return subscriptionService.previewForUser(params.id);
});
