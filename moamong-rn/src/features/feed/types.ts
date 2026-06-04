export interface Reaction {
  emoji: string;
  count: number;
  reacted: boolean;
}

export interface FeedItem {
  sharedItemId: number;
  senderUsername: string;
  category: string;
  amount: number | null;
  url: string;
  review: string | null;
  title: string | null;
  imageUrl: string | null;
  createdAt: string;
  reactions: Reaction[];
  commentCount: number;
  viewCount: number;
}

export interface FeedPage {
  content: FeedItem[];
  hasNext: boolean;
  nextCursor: number | null;
}

export interface FeedComment {
  id: number;
  username: string;
  content: string;
  createdAt: string;
}

export const SYSTEM_CATEGORIES = [
  { key: "ELECTRONICS", name: "전자 / IT",      emoji: "ELECTRONICS", color: "#3B82F6" },
  { key: "FOOD",        name: "식품 / 영양제",   emoji: "FOOD",        color: "#F97316" },
  { key: "BEAUTY",      name: "뷰티 / 패션",     emoji: "BEAUTY",      color: "#EC4899" },
  { key: "EVENT",       name: "이벤트 / 상품권", emoji: "Gift",        color: "#E11D48" },
  { key: "GAME",        name: "게임 / 앱",       emoji: "Gamepad2",    color: "#8B5CF6" },
  { key: "ETC",         name: "기타",            emoji: "ETC",         color: "#6B7280" },
] as const;

export type SystemCategoryKey = typeof SYSTEM_CATEGORIES[number]["key"];
