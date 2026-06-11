import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/src/lib/api";
import { feedKeys } from "../keys";
import { toast } from "@/src/lib/toast";
import { FeedItem } from "../types";

function updateFeedItem(data: any, sharedItemId: number, updater: (item: FeedItem) => FeedItem): any {
  if (!data?.pages) return data;
  return {
    ...data,
    pages: data.pages.map((page: any) => {
      if (Array.isArray(page)) {
        return page.map((roomPage: any) => ({
          ...roomPage,
          content: roomPage.content.map((item: FeedItem) =>
            item.sharedItemId === sharedItemId ? updater(item) : item
          ),
        }));
      }
      return {
        ...page,
        content: page.content.map((item: FeedItem) =>
          item.sharedItemId === sharedItemId ? updater(item) : item
        ),
      };
    }),
  };
}

export function useToggleReaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ sharedItemId, emoji }: { sharedItemId: number; emoji: string }) =>
      apiClient(`/api/shared-items/${sharedItemId}/reactions`, {
        method: "POST",
        body: JSON.stringify({ emoji }),
      }),
    onMutate: async ({ sharedItemId, emoji }) => {
      await queryClient.cancelQueries({ queryKey: feedKeys.all() });
      const prev = queryClient.getQueriesData({ queryKey: feedKeys.all() });

      queryClient.setQueriesData({ queryKey: feedKeys.all() }, (data: any) =>
        updateFeedItem(data, sharedItemId, (item) => {
          const existing = item.reactions.find((r) => r.emoji === emoji);
          if (existing) {
            return {
              ...item,
              reactions: item.reactions.map((r) =>
                r.emoji === emoji
                  ? { ...r, count: r.reacted ? r.count - 1 : r.count + 1, reacted: !r.reacted }
                  : r
              ),
            };
          }
          return {
            ...item,
            reactions: [...item.reactions, { emoji, count: 1, reacted: true }],
          };
        })
      );

      return { prev };
    },
    onError: (e: Error, _, context) => {
      context?.prev.forEach(([key, data]) => queryClient.setQueryData(key, data));
      toast.show(e.message);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: feedKeys.all() });
    },
  });
}
