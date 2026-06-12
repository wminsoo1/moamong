import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/src/lib/api";
import { roomKeys } from "../keys";

const notificationKey = (roomId: number) => ["room", roomId, "notification"];

export function useRoomNotification(roomId: number) {
  return useQuery({
    queryKey: notificationKey(roomId),
    queryFn: () => apiClient<{ enabled: boolean }>(`/api/rooms/${roomId}/notifications/me`),
    select: (data) => data.enabled,
    retry: (_, error) => (error as any)?.status !== 404,
  });
}

export function useToggleRoomNotification(roomId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => apiClient<{ enabled: boolean }>(`/api/rooms/${roomId}/notifications/me/toggle`, { method: "POST" }),
    onMutate: async () => {
      const key = notificationKey(roomId);
      await queryClient.cancelQueries({ queryKey: key });
      const prev = queryClient.getQueryData<{ enabled: boolean }>(key);
      queryClient.setQueryData(key, (old: { enabled: boolean } | undefined) =>
        old ? { enabled: !old.enabled } : { enabled: false }
      );
      return { prev };
    },
    onError: (_, __, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(notificationKey(roomId), ctx.prev);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: notificationKey(roomId) });
      queryClient.invalidateQueries({ queryKey: roomKeys.all() });
    },
  });
}
