import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/src/lib/api";
import { feedKeys } from "../keys";
import { toast } from "@/src/lib/toast";

export function useToggleReaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ sharedItemId, emoji }: { sharedItemId: number; emoji: string }) =>
      apiClient(`/api/shared-items/${sharedItemId}/reactions`, {
        method: "POST",
        body: JSON.stringify({ emoji }),
      }),
    onError: (e: Error) => toast.show(e.message),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: feedKeys.all() });
    },
  });
}
