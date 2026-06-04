export type CategoryGroup =
  | "FOOD" | "DAILY_GOODS" | "FASHION" | "HOUSING" | "TAX"
  | "TRANSPORT" | "HEALTH" | "LEISURE" | "EDUCATION" | "SOCIAL"
  | "TRAVEL" | "PETS" | "BIG_SPENDING" | "MISC"
  | "EMPLOYMENT" | "INVESTMENT" | "PENSION"
  | "ETC";

export const CATEGORY_GROUP_LABELS: Record<CategoryGroup, string> = {
  FOOD:        "식비",
  DAILY_GOODS: "생활",
  FASHION:     "쇼핑",
  HOUSING:     "주거/통신",
  TAX:         "금융/보험",
  TRANSPORT:   "교통/차량",
  HEALTH:      "의료/건강",
  LEISURE:     "여가/취미",
  EDUCATION:   "교육",
  SOCIAL:      "모임/선물",
  TRAVEL:      "여행",
  PETS:        "반려동물",
  BIG_SPENDING:"대형지출",
  MISC:        "기타",
  EMPLOYMENT:  "근로소득",
  INVESTMENT:  "투자/재테크",
  PENSION:     "연금/수당",
  ETC:         "기타",
};

export const CATEGORY_GROUP_ICONS: Record<CategoryGroup, string> = {
  FOOD:        "Utensils",
  DAILY_GOODS: "ShoppingBasket",
  FASHION:     "Shirt",
  HOUSING:     "Home",
  TAX:         "ShieldCheck",
  TRANSPORT:   "Bus",
  HEALTH:      "HeartPulse",
  LEISURE:     "Gamepad2",
  EDUCATION:   "GraduationCap",
  SOCIAL:      "Gift",
  TRAVEL:      "Plane",
  PETS:        "PawPrint",
  BIG_SPENDING:"Tv",
  MISC:        "Package",
  EMPLOYMENT:  "Banknote",
  INVESTMENT:  "TrendingUp",
  PENSION:     "PiggyBank",
  ETC:         "Coins",
};

export const EXPENSE_GROUPS: CategoryGroup[] = [
  "FOOD", "DAILY_GOODS", "FASHION", "HOUSING", "TAX",
  "TRANSPORT", "HEALTH", "LEISURE", "EDUCATION", "SOCIAL",
  "TRAVEL", "PETS", "BIG_SPENDING", "MISC",
];

export const INCOME_GROUPS: CategoryGroup[] = [
  "EMPLOYMENT", "INVESTMENT", "PENSION", "ETC",
];

export const CATEGORY_GROUP_COLORS: Record<CategoryGroup, string> = {
  FOOD:        "#F97316",
  DAILY_GOODS: "#06B6D4",
  FASHION:     "#EC4899",
  HOUSING:     "#3B82F6",
  TAX:         "#10B981",
  TRANSPORT:   "#6366F1",
  HEALTH:      "#EF4444",
  LEISURE:     "#8B5CF6",
  EDUCATION:   "#F59E0B",
  SOCIAL:      "#E11D48",
  TRAVEL:      "#14B8A6",
  PETS:        "#D946EF",
  BIG_SPENDING:"#71717A",
  MISC:        "#9CA3AF",
  EMPLOYMENT:  "#F59E0B",
  INVESTMENT:  "#3B82F6",
  PENSION:     "#607D8B",
  ETC:         "#6B7280",
};

export interface UserCategoryGroup {
  groupKey: CategoryGroup;
  label: string;
  color: string;
  icon: string;
  sortOrder: number;
}

export interface UserCategory {
  id: number;
  name: string;
  type: string;
  parentGroup: CategoryGroup;
  parentGroupLabel: string;
  sortOrder: number;
}
