export const roomKeys = {
  all: () => ["rooms"] as const,
  members: (roomId: number) => ["rooms", roomId, "members"] as const,
};
