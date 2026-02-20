import { staticNodeService } from "~/server/utils/services/static-node-service";
import { parseQueryParams } from "~/server/utils/validation/parse";
import { listStaticNodesQuerySchema } from "~/server/utils/validation/schemas/static-nodes";

export default defineEventHandler(async (event) => {
  const query = parseQueryParams(event, listStaticNodesQuerySchema);
  return staticNodeService.list(query);
});
