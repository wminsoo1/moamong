export const userKeys = {
  me: () => ["user", "me"] as const,
  categories: () => ["user-categories"] as const,
  categoryGroups: () => ["user-category-groups"] as const,
  shareSettings: () => ["user", "share-settings"] as const,
  accountShareSettings: () => ["user", "account-share-settings"] as const,
};
