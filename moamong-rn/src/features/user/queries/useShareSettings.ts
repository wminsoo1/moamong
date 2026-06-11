import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/src/lib/api";
import { userKeys } from "../keys";

export function useShareSettings() {
  return useQuery({
    queryKey: userKeys.shareSettings(),
    queryFn: () => apiClient<{ roomIds: number[] }>("/api/users/me/share-settings"),
  });
}
