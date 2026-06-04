import { useInfiniteQuery } from "@tanstack/react-query";
import { apiClient } from "@/src/lib/api";
import { feedKeys } from "../keys";
import { FeedItem, FeedPage } from "../types";

const PAGE_SIZE = 20;

interface Room {
  id: number;
}

function buildUrl(roomId: number, cursor?: number) {
  const base = `/api/shared-items?roomId=${roomId}&size=${PAGE_SIZE}`;
  return cursor ? `${base}&cursor=${cursor}` : base;
}

function deduped(items: FeedItem[]): FeedItem[] {
  const seen = new Set<number>();
  return items.filter((item) => {
    if (!item?.sharedItemId) return false;
    if (seen.has(item.sharedItemId)) return false;
    seen.add(item.sharedItemId);
    return true;
  });
}

export function useFeed(rooms: Room[], selectedRoomId: number | null) {
  // Single room: straightforward infinite query
  const roomQuery = useInfiniteQuery({
    queryKey: feedKeys.byRoom(selectedRoomId ?? -1),
    queryFn: ({ pageParam }) =>
      apiClient<FeedPage>(buildUrl(selectedRoomId!, pageParam)),
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    initialPageParam: undefined as number | undefined,
    enabled: selectedRoomId !== null && rooms.length > 0,
  });

  // All rooms: fetch each room in parallel per page
  // pageParam = Record<roomId, cursor>
  const allRoomsQuery = useInfiniteQuery({
    queryKey: feedKeys.allRooms(rooms.map((r) => r.id)),
    queryFn: async ({ pageParam = {} }) => {
      const cursors = pageParam as Record<number, number>;
      const pages = await Promise.all(
        rooms.map((r) =>
          apiClient<FeedPage>(buildUrl(r.id, cursors[r.id])).then((data) => ({
            ...data,
            roomId: r.id,
          }))
        )
      );
      return pages;
    },
    getNextPageParam: (lastPage) => {
      const next: Record<number, number> = {};
      lastPage.forEach((p) => {
        if (p.nextCursor) next[p.roomId] = p.nextCursor;
      });
      return Object.keys(next).length > 0 ? next : undefined;
    },
    initialPageParam: {} as Record<number, number>,
    enabled: selectedRoomId === null && rooms.length > 0,
  });

  if (selectedRoomId !== null) {
    const feedItems = (roomQuery.data?.pages.flatMap((p) => p.content) ?? []).filter(Boolean);
    return {
      feedItems,
      fetchNextPage: roomQuery.fetchNextPage,
      hasNextPage: roomQuery.hasNextPage ?? false,
      isFetchingNextPage: roomQuery.isFetchingNextPage,
    };
  }

  const allItems = (allRoomsQuery.data?.pages ?? [])
    .flatMap((page) => page.flatMap((rp) => rp.content))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return {
    feedItems: deduped(allItems),
    fetchNextPage: allRoomsQuery.fetchNextPage,
    hasNextPage: allRoomsQuery.hasNextPage ?? false,
    isFetchingNextPage: allRoomsQuery.isFetchingNextPage,
  };
}
