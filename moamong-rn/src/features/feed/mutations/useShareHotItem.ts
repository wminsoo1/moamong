import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { apiClient } from "@/src/lib/api";
import { feedKeys } from "../keys";
import { SystemCategoryKey } from "../types";
import { UserCategory } from "@/src/features/user/types";

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
    mutationFn: async ({ url, amount, roomIds, category, title, imageUrl, review, isPublic }: ShareHotItemInput) => {
      const todayStr = format(new Date(), "yyyy-MM-dd");
      const spending = await apiClient<{ id: number }>("/api/spendings", {
        method: "POST",
        body: JSON.stringify({ type: "EXPENSE", categoryGroupKey: "MISC", amount, date: todayStr }),
      });
      return apiClient(`/api/spendings/${spending.id}/shared-item/manual`, {
        method: "POST",
        body: JSON.stringify({ url, roomIds, category, title, imageUrl, review, isPublic }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: feedKeys.all() });
    },
  });
}
