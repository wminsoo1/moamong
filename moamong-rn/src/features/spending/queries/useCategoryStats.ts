import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/src/lib/api";
import { spendingKeys } from "../keys";

export function useCategoryStats<T = unknown>(year: number, month: number) {
  return useQuery<T>({
    queryKey: spendingKeys.categoryStats(year, month),
    queryFn: () => apiClient<T>(`/api/stats/category?year=${year}&month=${month}`),
    retry: 0,
  });
}
