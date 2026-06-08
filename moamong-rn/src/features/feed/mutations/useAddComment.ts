import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/src/lib/api";
import { feedKeys } from "../keys";
import { toast } from "@/src/lib/toast";

export function useAddComment() {
  const queryClient = useQueryClient();
  return useMutation({
    retry: 2,
    mutationFn: ({ sharedItemId, content, roomId }: { sharedItemId: number; content: string; roomId?: number }) =>
      apiClient(`/api/shared-items/${sharedItemId}/comments`, {
        method: "POST",
        body: JSON.stringify({ content, roomId: roomId?.toString() }),
      }),
    onSuccess: (_, { sharedItemId }) => {
      queryClient.invalidateQueries({ queryKey: feedKeys.comments(sharedItemId) });
      queryClient.invalidateQueries({ queryKey: feedKeys.all() });
    },
    onError: (e: Error) => toast.show(e.message),
  });
}
