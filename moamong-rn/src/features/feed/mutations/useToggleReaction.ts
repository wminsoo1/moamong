import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/src/lib/api";
import { feedKeys } from "../keys";

export function useToggleReaction() {
  const queryClient = useQueryClient();
  return useMutation({
    retry: 2,
    mutationFn: ({ sharedItemId, emoji }: { sharedItemId: number; emoji: string }) =>
      apiClient(`/api/shared-items/${sharedItemId}/reactions`, {
        method: "POST",
        body: JSON.stringify({ emoji }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: feedKeys.all() });
    },
  });
}
