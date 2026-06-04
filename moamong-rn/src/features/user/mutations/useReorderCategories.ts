import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/src/lib/api";
import { userKeys } from "../keys";

export function useReorderCategories() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (orderedIds: number[]) =>
      apiClient("/api/users/me/categories/order", {
        method: "PATCH",
        body: JSON.stringify({ orderedIds }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.categories() });
    },
  });
}
