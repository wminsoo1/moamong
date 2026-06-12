import { useEffect } from "react";
import * as Notifications from "expo-notifications";
import { useRooms } from "../queries/useRooms";

export function useUnreadBadge() {
  const { rooms } = useRooms();
  const total = rooms
    .filter((r) => !r.isSystem)
    .reduce((sum, r) => sum + r.unreadSpendingCount, 0);

  useEffect(() => {
    Notifications.setBadgeCountAsync(total);
  }, [total]);

  return total;
}
