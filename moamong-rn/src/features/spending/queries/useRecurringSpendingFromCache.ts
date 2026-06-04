import { useQueryClient } from "@tanstack/react-query";
import { RecurringSpending } from "../types";
import { spendingKeys } from "../keys";

export function useRecurringSpendingFromCache(id: number) {
  const queryClient = useQueryClient();
  const list = queryClient.getQueryData<RecurringSpending[]>(spendingKeys.recurring());
  return list?.find((r) => r.id === id) ?? null;
}
