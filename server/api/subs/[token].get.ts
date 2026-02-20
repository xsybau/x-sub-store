import { Buffer } from "node:buffer";
import { subscriptionService } from "~/server/utils/services/subscription-service";
import {
  parseQueryParams,
  parseRouteParams,
} from "~/server/utils/validation/parse";
import {
  subscriptionFormatQuerySchema,
  tokenParamsSchema,
} from "~/server/utils/validation/schemas/subscriptions";

export default defineEventHandler(async (event) => {
  setResponseHeader(event, "Content-Type", "text/plain; charset=utf-8");

  const params = parseRouteParams(event, tokenParamsSchema);
  const query = parseQueryParams(event, subscriptionFormatQuerySchema);

  const result = await subscriptionService.resolveByToken({
    token: params.token,
  });

  setResponseHeader(event, "ETag", result.etag);
  if (query.format === "base64") {
    return result.contentBase64;
  }

  return Buffer.from(result.contentBase64, "base64").toString("utf-8");
});
