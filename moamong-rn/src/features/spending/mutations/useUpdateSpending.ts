import { useMutation, useQueryClient } from "@tanstack/react-query";
import { parseISO } from "date-fns";
import { apiClient } from "@/src/lib/api";
import { SpendingInput } from "../types";
import { spendingKeys } from "../keys";

export function useUpdateSpending(spendingId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    meta: { suppressToast: true },
    mutationFn: (data: SpendingInput) =>
      apiClient(`/api/spendings/${spendingId}`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: (_, variables) => {
      const d = parseISO(variables.date);
      const year = d.getFullYear();
      const month = d.getMonth() + 1;
      queryClient.invalidateQueries({ queryKey: spendingKeys.byMonth(year, month) });
      queryClient.invalidateQueries({ queryKey: spendingKeys.weeklyStats(year, month) });
      queryClient.invalidateQueries({ queryKey: spendingKeys.categoryStats(year, month) });
    },
  });
}
