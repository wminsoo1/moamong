import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/src/lib/api";
import { userKeys } from "../keys";
import { UserCategoryGroup } from "../types";

export function useCategoryGroups() {
  return useQuery<UserCategoryGroup[]>({
    queryKey: userKeys.categoryGroups(),
    queryFn: () => apiClient<UserCategoryGroup[]>("/api/users/me/category-groups"),
  });
}
