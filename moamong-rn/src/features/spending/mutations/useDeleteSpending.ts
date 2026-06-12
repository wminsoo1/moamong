import { useMutation, useQueryClient } from "@tanstack/react-query";
import { parseISO } from "date-fns";
import { apiClient } from "@/src/lib/api";
import { spendingKeys } from "../keys";

export function useDeleteSpending() {
  const queryClient = useQueryClient();
  return useMutation({
    meta: { suppressToast: true },
    mutationFn: ({ spendingId, date: _ }: { spendingId: number; date: string }) =>
      apiClient(`/api/spendings/${spendingId}`, { method: "DELETE" }),
    onSuccess: (_, { date }) => {
      const d = parseISO(date);
      const year = d.getFullYear();
      const month = d.getMonth() + 1;
      queryClient.invalidateQueries({ queryKey: spendingKeys.byMonth(year, month) });
      queryClient.invalidateQueries({ queryKey: spendingKeys.weeklyStats(year, month) });
      queryClient.invalidateQueries({ queryKey: spendingKeys.categoryStats(year, month) });
      queryClient.invalidateQueries({ queryKey: ["spendings", "room"] });
      queryClient.invalidateQueries({ queryKey: ["spendings", "member"] });
    },
  });
}
