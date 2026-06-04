import { useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { clearSessionId } from "@/src/lib/api";

export function useLogout() {
  const queryClient = useQueryClient();

  const logout = async () => {
    await clearSessionId();
    queryClient.clear();
    router.replace("/(auth)/login");
  };

  return { logout };
}
