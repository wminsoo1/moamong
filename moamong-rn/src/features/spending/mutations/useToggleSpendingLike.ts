import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/src/lib/api";
import { spendingKeys } from "../keys";
import { RoomSpending } from "../types";

export function useToggleSpendingLike(roomId: number, year: number, month: number) {
  const queryClient = useQueryClient();
  const key = spendingKeys.roomMonthly(roomId, year, month);

  return useMutation({
    mutationFn: (spendingId: number) =>
      apiClient(`/api/rooms/${roomId}/spendings/${spendingId}/likes`, { method: "POST" }),
    onMutate: async (spendingId) => {
      await queryClient.cancelQueries({ queryKey: key });
      const prev = queryClient.getQueryData<RoomSpending[]>(key);
      queryClient.setQueryData<RoomSpending[]>(key, (old) =>
        old?.map((s) =>
          s.id === spendingId
            ? { ...s, liked: !s.liked, likeCount: s.liked ? s.likeCount - 1 : s.likeCount + 1 }
            : s
        )
      );
      return { prev };
    },
    onError: (_, __, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(key, ctx.prev);
    },
  });
}
