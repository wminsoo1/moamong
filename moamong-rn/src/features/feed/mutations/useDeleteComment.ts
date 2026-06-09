import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/src/lib/api";
import { feedKeys } from "../keys";
import { toast } from "@/src/lib/toast";

export function useDeleteComment(sharedItemId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (commentId: number) =>
      apiClient(`/api/shared-items/comments/${commentId}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: feedKeys.comments(sharedItemId) });
      queryClient.invalidateQueries({ queryKey: feedKeys.all() });
    },
    onError: (e: Error) => toast.show(e.message),
  });
}
