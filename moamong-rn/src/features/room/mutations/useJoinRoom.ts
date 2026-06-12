import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/src/lib/api";
import { roomKeys } from "../keys";

export function useJoinRoom() {
  const queryClient = useQueryClient();
  return useMutation({
    meta: { suppressToast: true },
    mutationFn: (inviteCode: string) =>
      apiClient(`/api/rooms/join`, { method: "POST", body: JSON.stringify({ inviteCode }) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roomKeys.all(), exact: true });
    },
  });
}
