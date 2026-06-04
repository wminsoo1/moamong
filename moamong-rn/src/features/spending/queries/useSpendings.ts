import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/src/lib/api";
import { Spending } from "../types";
import { spendingKeys } from "../keys";

export function useSpendings(year: number, month: number) {
  const { data: spendings = [] } = useQuery<Spending[]>({
    queryKey: spendingKeys.byMonth(year, month),
    queryFn: () => apiClient<Spending[]>(`/api/spendings?year=${year}&month=${month}`),
  });

  return { spendings };
}
