import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/src/lib/api";
import { userKeys } from "../keys";

export function useReorderCategoryGroups() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (orderedKeys: string[]) =>
      apiClient("/api/users/me/category-groups/order", {
        method: "PATCH",
        body: JSON.stringify({ orderedKeys }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.categoryGroups() });
    },
  });
}
