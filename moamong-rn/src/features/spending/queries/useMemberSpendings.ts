import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/src/lib/api";
import { spendingKeys } from "../keys";
import { Spending } from "../types";

export function useMemberSpendings(userId: number, year: number, month: number) {
  return useQuery({
    queryKey: spendingKeys.memberMonthly(userId, year, month),
    queryFn: () => apiClient<Spending[]>(`/api/spendings/members/${userId}?year=${year}&month=${month}`),
    enabled: !!userId && !isNaN(userId),
  });
}
