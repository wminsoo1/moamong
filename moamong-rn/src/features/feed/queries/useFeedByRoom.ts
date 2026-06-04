import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/src/lib/api";
import { feedKeys } from "../keys";
import { FeedItem } from "../types";

export function useFeedByRoom(roomId: number) {
  const { data = [], isLoading } = useQuery<FeedItem[]>({
    queryKey: feedKeys.byRoom(roomId),
    queryFn: () => apiClient<FeedItem[]>(`/api/shared-items?roomId=${roomId}`),
  });

  return { feedItems: data, isLoading };
}
