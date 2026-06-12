import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/src/lib/api";
import { roomKeys } from "../keys";

export function useRenameRoom() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ roomId, name }: { roomId: number; name: string }) =>
      apiClient(`/api/rooms/${roomId}/name`, {
        method: "PATCH",
        body: JSON.stringify({ name }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roomKeys.all(), exact: true });
    },
  });
}
