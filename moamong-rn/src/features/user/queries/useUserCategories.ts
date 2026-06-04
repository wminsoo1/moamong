import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/src/lib/api";
import { userKeys } from "../keys";
import { UserCategory } from "../types";

export type { UserCategory };

export function useUserCategories() {
  const { data: userCategories = [] } = useQuery<UserCategory[]>({
    queryKey: userKeys.categories(),
    queryFn: () => apiClient<UserCategory[]>("/api/users/me/categories"),
  });

  return { userCategories };
}
