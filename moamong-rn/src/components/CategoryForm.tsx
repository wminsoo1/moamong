import { memo } from "react";
import { View, Text, Pressable, StyleSheet, Dimensions } from "react-native";
import { CategoryIcon } from "@/src/components/CategoryIcon";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
export const ICON_SIZE = (SCREEN_WIDTH - 40 - 10 * 4) / 5;

export const CATEGORY_COLORS = [
  // 레드/핑크
  "#EF4444", "#F43F5E", "#EC4899", "#DB2777",
  // 오렌지/옐로우
  "#F97316", "#FB923C", "#F59E0B", "#EAB308",
  // 그린
  "#22C55E", "#16A34A", "#10B981", "#059669",
  // 블루/스카이
  "#3B82F6", "#2563EB", "#0EA5E9", "#0284C7",
  // 퍼플/인디고
  "#8B5CF6", "#7C3AED", "#6366F1", "#4F46E5",
  // 틸/에메랄드
  "#14B8A6", "#0D9488", "#06B6D4", "#0891B2",
  // 뉴트럴
  "#6B7280", "#374151", "#1F2937", "#78716C",
];

export const PREDEFINED_ICON_NAMES = [
  "Utensils", "Coffee", "Pizza", "Sandwich", "Soup", "Beer", "Wine", "IceCreamCone", "CupSoda",
  "ShoppingCart", "ShoppingBasket", "ShoppingBag", "Tag", "Package", "Gift", "Shirt",
  "Car", "Train", "Bus", "Plane", "Bike", "Ship", "Fuel",
  "Music", "Film", "Gamepad2", "Headphones", "Tv", "Ticket", "Camera", "Palette", "Paintbrush",
  "BookOpen", "GraduationCap", "Newspaper", "PenLine",
  "Stethoscope", "Pill", "HeartPulse", "Heart", "Dumbbell", "Scissors", "Sparkles",
  "Home", "Building2", "Lightbulb", "Wrench", "Sofa", "Bed", "Hammer", "Droplets", "Leaf",
  "CreditCard", "Wallet", "PiggyBank", "TrendingUp", "Shield", "Banknote", "Coins", "Percent", "Calculator", "Receipt",
  "Smartphone", "Laptop", "Monitor", "Wifi", "Bell",
  "Dog", "Cat", "Baby", "Users",
  "Globe", "Mountain", "Sun", "Luggage", "Map",
  "Gem", "Trophy", "Star", "Zap", "Flame", "Umbrella", "BarChart2", "MoreHorizontal",
];

export const GROUP_ICONS: Record<string, string[]> = {
  // 식비 — 음식/음료 중심 (토스: 포크&나이프, Zaim: 食費)
  FOOD:        ["Utensils", "Coffee", "Pizza", "Soup", "Beer", "Wine", "IceCreamCone", "CupSoda", "Sandwich"],

  // 생활 — 장보기·생필품·청소 (토스: 장바구니)
  DAILY_GOODS: ["ShoppingBasket", "ShoppingCart", "Package", "Droplets", "Leaf", "Scissors", "Wrench"],

  // 쇼핑 — 의류·패션·뷰티 (토스: 쇼핑백)
  FASHION:     ["Shirt", "ShoppingBag", "Tag", "Gem", "Sparkles", "Scissors"],

  // 주거/통신 — 집·공과금·통신 (Home + Smartphone)
  HOUSING:     ["Home", "Smartphone", "Wifi", "Building2", "Lightbulb", "Droplets", "Sofa", "Wrench"],

  // 금융/보험 — 보험·세금·금융 (토스: 방패·카드)
  TAX:         ["ShieldCheck", "CreditCard", "Wallet", "Banknote", "Receipt", "Calculator", "Percent"],

  // 교통/차량 — 이동수단 (토스: 버스·자동차)
  TRANSPORT:   ["Bus", "Car", "Train", "Plane", "Bike", "Fuel", "Map", "Ship"],

  // 의료/건강 — 병원·운동·건강 (토스: 하트펄스)
  HEALTH:      ["HeartPulse", "Heart", "Stethoscope", "Pill", "Dumbbell", "Leaf", "Sparkles"],

  // 여가/취미 — 엔터테인먼트·취미 (토스: 필름, Zaim: 娯楽)
  LEISURE:     ["Film", "Music", "Gamepad2", "Headphones", "Ticket", "Camera", "Palette", "Trophy"],

  // 교육 — 학습·자기계발 (토스·Zaim: 졸업모)
  EDUCATION:   ["GraduationCap", "BookOpen", "PenLine", "Newspaper", "Monitor", "Laptop"],

  // 모임/선물 — 경조사·선물·교제 (토스: 선물상자)
  SOCIAL:      ["Gift", "Users", "Heart", "Star", "Ticket", "Sparkles"],

  // 여행 — 국내외 여행 (비행기·캐리어)
  TRAVEL:      ["Plane", "Luggage", "Globe", "Map", "Mountain", "Sun", "Camera"],

  // 반려동물 — 펫 케어 (발바닥·강아지·고양이)
  PETS:        ["PawPrint", "Dog", "Cat", "Heart", "Scissors", "ShoppingBag"],

  // 대형지출 — 가전·가구·전자기기
  BIG_SPENDING:["Tv", "Laptop", "Sofa", "Gem", "ShoppingBag", "Trophy", "Luggage"],

  // 근로소득 — 월급·급여 (지폐·건물)
  EMPLOYMENT:  ["Banknote", "Building2", "Wallet", "TrendingUp", "CreditCard", "Coins"],

  // 투자/재테크 — 주식·이자·자산 (차트·돼지저금통)
  INVESTMENT:  ["TrendingUp", "BarChart2", "PiggyBank", "Coins", "Percent", "Banknote"],

  // 연금/수당 — 연금·정부지원 (저금통·방패)
  PENSION:     ["PiggyBank", "ShieldCheck", "Wallet", "Banknote", "Receipt"],

  // 기타지출
  MISC:        ["Package", "MoreHorizontal", "Star", "Umbrella", "Globe", "Flame"],
  // 기타수입
  ETC:         ["Coins", "MoreHorizontal", "Star", "Package", "Umbrella", "Globe"],
};

export const IconGrid = memo(({ selectedEmoji, selectedColor, onSelect, icons }: {
  selectedEmoji: string;
  selectedColor: string;
  onSelect: (name: string) => void;
  icons?: string[];
}) => (
  <View style={styles.iconGrid}>
    {(icons ?? PREDEFINED_ICON_NAMES).map((iconName) => {
      const isSelected = selectedEmoji === iconName;
      return (
        <Pressable
          key={iconName}
          onPress={() => onSelect(iconName)}
          style={[styles.iconBtn, { backgroundColor: isSelected ? selectedColor : "#f2f4f6" }]}
        >
          <CategoryIcon emoji={iconName} color={isSelected ? "#fff" : "#8b95a1"} isWhite={isSelected} size={20} />
        </Pressable>
      );
    })}
  </View>
));

export const ColorPicker = memo(({ selectedColor, onSelect }: {
  selectedColor: string;
  onSelect: (color: string) => void;
}) => (
  <View style={styles.colorPicker}>
    {CATEGORY_COLORS.map((c) => (
      <Pressable key={c} onPress={() => onSelect(c)} style={[styles.colorCircle, { backgroundColor: c }, selectedColor === c && { borderWidth: 3, borderColor: c }]}>
        {selectedColor === c && <Text style={styles.colorCheckmark}>✓</Text>}
      </Pressable>
    ))}
  </View>
));

const styles = StyleSheet.create({
  iconGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, paddingBottom: 40 },
  iconBtn: { width: ICON_SIZE, height: ICON_SIZE, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  colorPicker: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  colorCircle: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  colorCheckmark: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
