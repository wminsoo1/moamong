import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/src/lib/api";
import { RecurringSpendingInput } from "../types";
import { spendingKeys } from "../keys";

export function useUpdateRecurringSpending() {
  const queryClient = useQueryClient();
  return useMutation({
    meta: { suppressToast: true },
    mutationFn: ({ id, data }: { id: number; data: RecurringSpendingInput }) =>
      apiClient(`/api/recurring-spendings/${id}`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: spendingKeys.recurring() });
    },
  });
}
