import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/src/lib/api";
import { feedKeys } from "../keys";
import { FeedComment } from "../types";

export function useComments(sharedItemId: number | null, roomId: number | null = null) {
  const { data: comments = [] } = useQuery<FeedComment[]>({
    queryKey: [...feedKeys.comments(sharedItemId ?? 0), roomId],
    queryFn: () => {
      const url = roomId
        ? `/api/shared-items/${sharedItemId}/comments?roomId=${roomId}`
        : `/api/shared-items/${sharedItemId}/comments`;
      return apiClient<FeedComment[]>(url);
    },
    enabled: sharedItemId !== null,
  });

  return { comments };
}
