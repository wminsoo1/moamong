import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/src/lib/api";
import { feedKeys } from "../keys";

interface SharedItemInput {
  spendingId: number;
  url: string;
  category: string;
  roomIds: number[];
  isPublic: boolean;
  title: string;
  imageUrl: string | null;
  review: string | null;
}

export function useCreateSharedItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ spendingId, ...data }: SharedItemInput) =>
      apiClient(`/api/spendings/${spendingId}/shared-item/manual`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: feedKeys.all() });
    },
  });
}
