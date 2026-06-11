import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/src/lib/api";
import { userKeys } from "../keys";

export function useUpdateShareSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (roomIds: number[]) =>
      apiClient<{ roomIds: number[] }>("/api/users/me/share-settings", {
        method: "PUT",
        body: JSON.stringify({ roomIds }),
      }),
    onSuccess: (data) => {
      queryClient.setQueryData(userKeys.shareSettings(), data);
    },
  });
}
