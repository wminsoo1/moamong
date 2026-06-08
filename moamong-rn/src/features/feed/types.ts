export interface Reaction {
  emoji: string;
  count: number;
  reacted: boolean;
}

export interface FeedItem {
  sharedItemId: number;
  userId: number;
  shareGroupId: string;
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
  userId: number;
  username: string;
  content: string;
  createdAt: string;
}

export const SYSTEM_CATEGORIES = [
  { key: "ELECTRONICS", name: "전자 / IT",    emoji: "ELECTRONICS", color: "#3B82F6" },
  { key: "FOOD",        name: "식품 / 영양제", emoji: "FOOD",        color: "#F97316" },
  { key: "BEAUTY",      name: "뷰티 / 헬스",  emoji: "BEAUTY",      color: "#EC4899" },
  { key: "FASHION",     name: "패션 / 의류",  emoji: "FASHION",     color: "#E11D48" },
  { key: "SPORTS",      name: "스포츠 / 레저", emoji: "SPORTS",      color: "#10B981" },
  { key: "HOME",        name: "홈 / 리빙",    emoji: "HOME",        color: "#F59E0B" },
  { key: "ETC",         name: "기타",          emoji: "ETC",         color: "#6B7280" },
] as const;

export type SystemCategoryKey = typeof SYSTEM_CATEGORIES[number]["key"];
