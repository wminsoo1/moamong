import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/src/lib/api";
import { roomKeys } from "../keys";

export function useLeaveRoom() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (roomId: number) =>
      apiClient(`/api/rooms/${roomId}/leave`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roomKeys.all() });
    },
  });
}
