import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/src/lib/api";
import { spendingKeys } from "../keys";
import { RoomSpending, SpendingComment } from "../types";

interface AddCommentInput {
  type?: "TEXT" | "VOICE";
  content?: string;
  audioUrl?: string;
}

export function useAddComment(roomId: number, spendingId: number) {
  const queryClient = useQueryClient();
  const roomKey = ["spendings", "room", roomId];

  return useMutation({
    mutationFn: (input: AddCommentInput) =>
      apiClient<SpendingComment>(`/api/rooms/${roomId}/spendings/${spendingId}/comments`, {
        method: "POST",
        body: JSON.stringify({ type: input.type ?? "TEXT", content: input.content, audioUrl: input.audioUrl }),
      }),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: roomKey });
      const prev = queryClient.getQueriesData<RoomSpending[]>({ queryKey: roomKey });
      queryClient.setQueriesData<RoomSpending[]>({ queryKey: roomKey }, (old) =>
        old?.map((s) => s.id === spendingId ? { ...s, commentCount: s.commentCount + 1 } : s)
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
