import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/src/lib/api";
import { feedKeys } from "../keys";
import { FeedItem } from "../types";

export function useRecordView() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sharedItemId: number) =>
      apiClient(`/api/shared-items/${sharedItemId}/view`, { method: "POST" }),
    onSuccess: (_, sharedItemId) => {
      const increment = (items: FeedItem[]) =>
        items.map((item) =>
          item.sharedItemId === sharedItemId
            ? { ...item, viewCount: item.viewCount + 1 }
            : item
        );

      queryClient.setQueriesData({ queryKey: feedKeys.all() }, (old: any) => {
        if (!old?.pages) return old;
        return {
          ...old,
          pages: old.pages.map((page: any) => {
            // 단일 방 쿼리: page = FeedPage { content, hasNext, nextCursor }
            if (page.content) return { ...page, content: increment(page.content) };
            // 전체 방 쿼리: page = (FeedPage & { roomId })[]
            if (Array.isArray(page)) return page.map((rp: any) => ({ ...rp, content: increment(rp.content) }));
            return page;
          }),
        };
      });
    },
  });
}
