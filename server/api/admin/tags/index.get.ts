import { tagService } from "~/server/utils/services/tag-service";

export default defineEventHandler(async () => {
  return tagService.list();
});
