import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/src/lib/api";
import { spendingKeys } from "../keys";

export function useDeleteComment(spendingId: number, roomId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (commentId: number) =>
      apiClient(`/api/spendings/${spendingId}/comments/${commentId}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: spendingKeys.comments(spendingId) });
      queryClient.invalidateQueries({ queryKey: ["spendings", "room"] });
    },
  });
}
