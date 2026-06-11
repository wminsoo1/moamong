import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/src/lib/api";
import { feedKeys } from "../keys";
import { toast } from "@/src/lib/toast";

export function useDeleteSharedItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (sharedItemId: number) =>
      apiClient(`/api/shared-items/${sharedItemId}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: feedKeys.all() });
    },
    onError: (e: Error) => toast.show(e.message),
  });
}
