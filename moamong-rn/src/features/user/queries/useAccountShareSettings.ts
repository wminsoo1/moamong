import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/src/lib/api";
import { userKeys } from "../keys";

export function useAccountShareSettings() {
  return useQuery({
    queryKey: userKeys.accountShareSettings(),
    queryFn: () => apiClient<{ hiddenCategories: string[] }>("/api/users/me/account-share-settings"),
  });
}
