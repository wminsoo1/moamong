import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/src/lib/api";
import { spendingKeys } from "../keys";

export function useWeeklyStats<T = unknown>(year: number, month: number) {
  return useQuery<T>({
    queryKey: spendingKeys.weeklyStats(year, month),
    queryFn: () => apiClient<T>(`/api/stats/weekly?year=${year}&month=${month}`),
    retry: 0,
  });
}
