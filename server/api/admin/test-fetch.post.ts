import { upstreamService } from "~/server/utils/services/upstream-service";
import { parseBody } from "~/server/utils/validation/parse";
import { testFetchBodySchema } from "~/server/utils/validation/schemas/upstreams";

export default defineEventHandler(async (event) => {
  const body = await parseBody(event, testFetchBodySchema);
  return upstreamService.testFetch(body);
});
