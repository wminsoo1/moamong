import { useQueryClient } from "@tanstack/react-query";
import { Spending } from "../types";
import { spendingKeys } from "../keys";

export function useSpendingFromCache(id: number, date: Date): Spending | null {
  const queryClient = useQueryClient();
  return queryClient.getQueryData<Spending[]>(
    spendingKeys.byMonth(date.getFullYear(), date.getMonth() + 1)
  )?.find((s) => s.id === id) ?? null;
}
