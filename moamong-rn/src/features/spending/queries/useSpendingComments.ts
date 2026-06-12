import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/src/lib/api";
import { spendingKeys } from "../keys";
import { SpendingComment } from "../types";

export function useSpendingComments(roomId: number, spendingId: number | null) {
  return useQuery({
    queryKey: spendingKeys.comments(spendingId ?? 0),
    queryFn: () => apiClient<SpendingComment[]>(`/api/rooms/${roomId}/spendings/${spendingId}/comments`),
    enabled: spendingId != null,
  });
}
