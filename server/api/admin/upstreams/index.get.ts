import { upstreamService } from "~/server/utils/services/upstream-service";
import { parseQueryParams } from "~/server/utils/validation/parse";
import { listUpstreamsQuerySchema } from "~/server/utils/validation/schemas/upstreams";

export default defineEventHandler(async (event) => {
  const query = parseQueryParams(event, listUpstreamsQuerySchema);
  return upstreamService.list(query);
});
