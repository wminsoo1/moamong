import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/src/lib/api";
import { roomKeys } from "../keys";

export interface RoomMember {
  userId: number;
  username: string;
}

export function useRoomMembers(roomId: number) {
  return useQuery({
    queryKey: roomKeys.members(roomId),
    queryFn: () => apiClient<RoomMember[]>(`/api/rooms/${roomId}/members`),
    enabled: !!roomId && !isNaN(roomId),
  });
}
