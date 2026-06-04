import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/src/lib/api";
import { userKeys } from "../keys";

interface UpdateCategoryInput {
  categoryId: number;
  name: string;
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    meta: { suppressToast: true },
    mutationFn: ({ categoryId, name }: UpdateCategoryInput) =>
      apiClient(`/api/users/me/categories/${categoryId}`, {
        method: "PATCH",
        body: JSON.stringify({ name }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.categories() });
    },
  });
}
