import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/src/lib/api";
import { userKeys } from "../keys";

export interface CurrentUser {
  id: number;
  username: string;
  nickname: string;
  profileImageUrl: string | null;
  notificationEnabled: boolean;
}

export function useCurrentUser() {
  const { data: user, isLoading } = useQuery<CurrentUser>({
    queryKey: userKeys.me(),
    queryFn: () => apiClient<CurrentUser>("/api/users/me"),
  });

  return { user, isLoading };
}
