import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/src/lib/api";
import { roomKeys } from "../keys";
import { toast } from "@/src/lib/toast";

export function useRegenerateInviteCode() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (roomId: number) =>
      apiClient<{ inviteCode: string }>(`/api/rooms/${roomId}/invite-code/regenerate`, { method: "POST" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roomKeys.all() });
    },
    onError: (e: Error) => toast.show(e.message),
  });
}
