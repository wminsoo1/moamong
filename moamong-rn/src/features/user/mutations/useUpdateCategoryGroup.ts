import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/src/lib/api";
import { userKeys } from "../keys";

interface UpdateCategoryGroupInput {
  groupKey: string;
  color: string;
  icon: string;
}

export function useUpdateCategoryGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ groupKey, color, icon }: UpdateCategoryGroupInput) =>
      apiClient(`/api/users/me/category-groups/${groupKey}`, {
        method: "PATCH",
        body: JSON.stringify({ color, icon }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.categoryGroups() });
    },
  });
}
