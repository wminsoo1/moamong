import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/src/lib/api";
import { userKeys } from "../keys";

export function useUpdateNickname() {
  const queryClient = useQueryClient();
  return useMutation({
    meta: { suppressToast: true },
    mutationFn: (username: string) =>
      apiClient("/api/users/me", {
        method: "PATCH",
        body: JSON.stringify({ username }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.me() });
    },
  });
}
