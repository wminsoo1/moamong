import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/src/lib/api";
import { spendingKeys } from "../keys";
import { RoomSpending } from "../types";

export function useRoomSpendings(roomId: number, year: number, month: number) {
  return useQuery({
    queryKey: spendingKeys.roomMonthly(roomId, year, month),
    queryFn: () => apiClient<RoomSpending[]>(`/api/rooms/${roomId}/spendings?year=${year}&month=${month}`),
    enabled: !!roomId && !isNaN(roomId),
    retry: (_, error) => (error as any)?.status !== 404,
  });
}
