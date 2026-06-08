import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/src/lib/api";
import { feedKeys } from "../keys";
import { SystemCategoryKey } from "../types";
import { toast } from "@/src/lib/toast";

interface ShareHotItemInput {
  url: string;
  amount: number;
  roomIds: number[];
  category: SystemCategoryKey;
  title: string;
  imageUrl: string | null;
  review: string;
  isPublic: boolean;
}

export function useShareHotItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ url, amount, roomIds, category, title, imageUrl, review, isPublic }: ShareHotItemInput) =>
      apiClient("/api/shared-items", {
        method: "POST",
        body: JSON.stringify({ url, amount, roomIds, category, title, imageUrl, review, isPublic }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: feedKeys.all() });
    },
    onError: (e: Error) => toast.show(e.message),
  });
}
