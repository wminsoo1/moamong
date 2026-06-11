import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/src/lib/api";
import { userKeys } from "../keys";

export function useUpdateAccountShareSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (hiddenCategories: string[]) =>
      apiClient<{ hiddenCategories: string[] }>("/api/users/me/account-share-settings", {
        method: "PUT",
        body: JSON.stringify({ hiddenCategories }),
      }),
    onSuccess: (data) => {
      queryClient.setQueryData(userKeys.accountShareSettings(), data);
    },
  });
}
