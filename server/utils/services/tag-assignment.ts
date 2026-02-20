export const mergeUserTagIds = (
  selectedTagIds: string[],
  defaultTagIds: string[],
): string[] => {
  return [...new Set([...selectedTagIds, ...defaultTagIds])];
};
