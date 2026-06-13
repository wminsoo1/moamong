import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/src/lib/api";
import { spendingKeys } from "../keys";
import { RoomSpending } from "../types";

export function useDeleteComment(spendingId: number, roomId: number) {
  const queryClient = useQueryClient();
  const roomKey = ["spendings", "room", roomId];

  return useMutation({
    mutationFn: (commentId: number) =>
      apiClient(`/api/rooms/${roomId}/spendings/${spendingId}/comments/${commentId}`, { method: "DELETE" }),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: roomKey });
      const prev = queryClient.getQueriesData<RoomSpending[]>({ queryKey: roomKey });
      queryClient.setQueriesData<RoomSpending[]>({ queryKey: roomKey }, (old) =>
        old?.map((s) => s.id === spendingId ? { ...s, commentCount: Math.max(0, s.commentCount - 1) } : s)
      );
      return { prev };
    },
    onError: (_, __, ctx) => {
      ctx?.prev.forEach(([key, data]) => queryClient.setQueryData(key, data));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: spendingKeys.comments(roomId, spendingId) });
    },
  });
}
