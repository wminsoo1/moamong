import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/src/lib/api";
import { RecurringSpending } from "../types";
import { spendingKeys } from "../keys";

export function useActiveRecurringSpendings(year: number, month: number) {
  const { data: activeRecurrings = [] } = useQuery<RecurringSpending[]>({
    queryKey: [...spendingKeys.recurring(), "active", year, month],
    queryFn: () =>
      apiClient<RecurringSpending[]>(
        `/api/recurring-spendings/active?year=${year}&month=${month}`
      ),
  });
  return { activeRecurrings };
}
