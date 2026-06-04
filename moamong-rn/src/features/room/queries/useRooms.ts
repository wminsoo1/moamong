import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/src/lib/api";
import { roomKeys } from "../keys";

interface Room {
  id: number;
  name: string;
  inviteCode: string;
  createdBy: number;
  unreadCount: number;
  isSystem: boolean;
}

export function useRooms() {
  const { data: rooms = [], isLoading } = useQuery<Room[]>({
    queryKey: roomKeys.all(),
    queryFn: () => apiClient<Room[]>("/api/rooms"),
  });

  return { rooms, isLoading };
}
