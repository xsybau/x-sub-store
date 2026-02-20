import { CacheEntry } from "~/server/models/CacheEntry";
import { User } from "~/server/models/User";
import type { SourceScope } from "~/server/utils/services/types";

interface InvalidateBySourceTarget {
  scope: SourceScope;
  userId?: string | null;
  tagId?: string | null;
}

const toUniqueIds = (ids: Array<string | null | undefined>): string[] => {
  return [...new Set(ids.filter((id): id is string => Boolean(id)))];
};

const invalidateAllCache = async () => {
  await CacheEntry.deleteMany({});
};

const invalidateUsersCache = async (userIds: string[]) => {
  const uniqueIds = toUniqueIds(userIds);
  if (!uniqueIds.length) {
    return;
  }

  await CacheEntry.deleteMany({
    userId: { $in: uniqueIds },
  });
};

const getUserIdsByTag = async (tagId: string): Promise<string[]> => {
  const users = await User.find({
    tagIds: tagId,
  }).select("_id");

  return users.map((user) => String(user._id));
};

const invalidateBySourceTarget = async (target: InvalidateBySourceTarget) => {
  if (target.scope === "GLOBAL") {
    await invalidateAllCache();
    return;
  }

  if (target.scope === "USER" && target.userId) {
    await invalidateUsersCache([target.userId]);
    return;
  }

  if (target.scope === "TAG" && target.tagId) {
    const userIds = await getUserIdsByTag(target.tagId);
    await invalidateUsersCache(userIds);
  }
};

export const cacheService = {
  getUserIdsByTag,
  invalidateAllCache,
  invalidateUsersCache,
  invalidateBySourceTarget,
};
