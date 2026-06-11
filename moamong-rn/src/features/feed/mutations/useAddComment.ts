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

export function useAddComment() {
  const queryClient = useQueryClient();
  return useMutation({
    retry: 2,
    mutationFn: ({ sharedItemId, content, roomId }: { sharedItemId: number; content: string; roomId?: number }) =>
      apiClient(`/api/shared-items/${sharedItemId}/comments`, {
        method: "POST",
        body: JSON.stringify({ content, roomId: roomId?.toString() }),
      }),
    onMutate: async ({ sharedItemId }) => {
      await queryClient.cancelQueries({ queryKey: feedKeys.all() });
      const prev = queryClient.getQueriesData({ queryKey: feedKeys.all() });

      queryClient.setQueriesData({ queryKey: feedKeys.all() }, (data: any) =>
        updateFeedItem(data, sharedItemId, (item) => ({
          ...item,
          commentCount: item.commentCount + 1,
        }))
      );

      return { prev };
    },
    onError: (e: Error, _, context) => {
      context?.prev.forEach(([key, data]) => queryClient.setQueryData(key, data));
      toast.show(e.message);
    },
    onSuccess: (_, { sharedItemId }) => {
      queryClient.invalidateQueries({ queryKey: feedKeys.comments(sharedItemId) });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: feedKeys.all() });
    },
  });
}
