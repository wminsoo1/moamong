export const feedKeys = {
  all: () => ["feed"] as const,
  byRoom: (roomId: number) => ["feed", "room", roomId] as const,
  allRooms: (roomIds: number[]) => ["feed", "all", ...roomIds] as const,
  comments: (sharedItemId: number) => ["comments", sharedItemId] as const,
};
