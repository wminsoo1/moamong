import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/src/lib/api";
import { roomKeys } from "../keys";
import { toast } from "@/src/lib/toast";

export function useKickMember(roomId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (targetUserId: number) =>
      apiClient(`/api/rooms/${roomId}/members/${targetUserId}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roomKeys.members(roomId) });
    },
    onError: (e: Error) => toast.show(e.message),
  });
}
