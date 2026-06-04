import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/src/lib/api";

export function useRegisterPushToken() {
  return useMutation({
    mutationFn: (token: string) =>
      apiClient("/api/users/me/fcm-token", {
        method: "PUT",
        body: JSON.stringify({ token }),
      }),
  });
}
