export const spendingKeys = {
  byMonth: (year: number, month: number) => ["spendings", year, month] as const,
  weeklyStats: (year: number, month: number) => ["stats-weekly", year, month] as const,
  categoryStats: (year: number, month: number) => ["stats-category", year, month] as const,
  recurring: () => ["recurring-spendings"] as const,
};
