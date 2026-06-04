import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/src/lib/api";
import { RecurringSpendingInput } from "../types";
import { spendingKeys } from "../keys";

export function useCreateRecurringSpending() {
  const queryClient = useQueryClient();
  return useMutation({
    meta: { suppressToast: true },
    mutationFn: (data: RecurringSpendingInput) =>
      apiClient("/api/recurring-spendings", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: spendingKeys.recurring() });
    },
  });
}
