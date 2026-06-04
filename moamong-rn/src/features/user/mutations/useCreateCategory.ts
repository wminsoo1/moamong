import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/src/lib/api";
import { userKeys } from "../keys";

interface CategoryInput {
  name: string;
  type: "EXPENSE" | "INCOME";
  parentGroup: string;
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    meta: { suppressToast: true },
    mutationFn: (data: CategoryInput) =>
      apiClient("/api/users/me/categories", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.categories() });
    },
  });
}
