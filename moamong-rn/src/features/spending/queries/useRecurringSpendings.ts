import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/src/lib/api";
import { RecurringSpending } from "../types";
import { spendingKeys } from "../keys";

export function useRecurringSpendings() {
  const { data: recurringSpendings = [], isLoading } = useQuery<RecurringSpending[]>({
    queryKey: spendingKeys.recurring(),
    queryFn: () => apiClient<RecurringSpending[]>("/api/recurring-spendings"),
  });
  return { recurringSpendings, isLoading };
}
