import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/src/lib/api";
import { roomKeys } from "../keys";

export function useMarkRoomRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (roomId: number) =>
      apiClient(`/api/rooms/${roomId}/read`, { method: "POST" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roomKeys.all() });
    },
  });
}
