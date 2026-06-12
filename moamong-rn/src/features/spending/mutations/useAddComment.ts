import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/src/lib/api";
import { spendingKeys } from "../keys";
import { SpendingComment } from "../types";

export function useAddComment(roomId: number, spendingId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (content: string) =>
      apiClient<SpendingComment>(`/api/rooms/${roomId}/spendings/${spendingId}/comments`, {
        method: "POST",
        body: JSON.stringify({ content }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: spendingKeys.comments(spendingId) });
      queryClient.invalidateQueries({ queryKey: ["spendings", "room"] });
    },
  });
}
