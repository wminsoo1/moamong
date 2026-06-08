import { useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { apiClient, clearSessionId } from "@/src/lib/api";

export function useLogout() {
  const queryClient = useQueryClient();

  const logout = async () => {
    try {
      await apiClient("/api/users/logout", { method: "POST" });
    } catch {
      // 세션이 이미 만료됐어도 로컬은 정리
    } finally {
      await clearSessionId();
      queryClient.clear();
      router.replace("/(auth)/login");
    }
  };

  return { logout };
}
