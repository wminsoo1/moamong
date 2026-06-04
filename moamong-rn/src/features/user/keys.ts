export const userKeys = {
  me: () => ["user", "me"] as const,
  categories: () => ["user-categories"] as const,
  categoryGroups: () => ["user-category-groups"] as const,
};
