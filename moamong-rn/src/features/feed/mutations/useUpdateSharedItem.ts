import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/src/lib/api";
import { feedKeys } from "../keys";
import { toast } from "@/src/lib/toast";

export interface UpdateSharedItemPayload {
  sharedItemId: number;
  title?: string;
  url?: string;
  imageUrl?: string;
  memo?: string;
  category?: string;
  amount?: number;
}

export function useUpdateSharedItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ sharedItemId, ...body }: UpdateSharedItemPayload) =>
      apiClient(`/api/shared-items/${sharedItemId}`, {
        method: "PUT",
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: feedKeys.all() });
    },
    onError: (e: Error) => toast.show(e.message),
  });
}
