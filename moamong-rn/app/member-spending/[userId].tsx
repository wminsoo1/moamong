import { useState, useMemo } from "react";
import { View, Text, Pressable, ScrollView, StyleSheet, Image, Modal, StatusBar } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { ChevronLeft, ChevronLeft as Prev, ChevronRight as Next, Camera, X } from "lucide-react-native";
import { useMemberSpendings } from "@/src/features/spending/queries/useMemberSpendings";
import { useGroupSettings } from "@/src/features/user/hooks/useGroupSettings";
import { CategoryIcon } from "@/src/components/CategoryIcon";
import { format, parseISO } from "date-fns";
import { ko } from "date-fns/locale";
import { Spending } from "@/src/features/spending/types";

function ImageViewer({ uri, onClose }: { uri: string; onClose: () => void }) {
  const insets = useSafeAreaInsets();
  return (
    <Modal visible animationType="fade" statusBarTranslucent onRequestClose={onClose}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <View style={iv.bg}>
        <Pressable onPress={onClose} style={[iv.closeBtn, { top: insets.top + 8 }]} hitSlop={12}>
          <X size={22} color="#fff" strokeWidth={2.5} />
        </Pressable>
        <Image source={{ uri }} style={iv.img} resizeMode="contain" />
      </View>
    </Modal>
  );
}

const iv = StyleSheet.create({
  bg: { flex: 1, backgroundColor: "#000", alignItems: "center", justifyContent: "center" },
  closeBtn: { position: "absolute", right: 16, width: 40, height: 40, alignItems: "center", justifyContent: "center", zIndex: 10 },
  img: { width: "100%", height: "80%" },
});

export default function MemberSpendingScreen() {
  const { userId, nickname } = useLocalSearchParams<{ userId: string; nickname: string }>();
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [viewingImage, setViewingImage] = useState<string | null>(null);

  const { data: spendings = [], isLoading } = useMemberSpendings(Number(userId), year, month);
  const { getColor, getIcon } = useGroupSettings();

  const grouped = useMemo(() => {
    const map = new Map<string, Spending[]>();
    for (const s of spendings) {
      const key = s.date;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(s);
    }
    return Array.from(map.entries()).sort((a, b) => b[0].localeCompare(a[0]));
  }, [spendings]);

  const totalExpense = spendings
    .filter((s) => s.type === "EXPENSE")
    .reduce((sum, s) => sum + s.amount, 0);

  const prevMonth = () => {
    if (month === 1) { setYear(y => y - 1); setMonth(12); }
    else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (month === 12) { setYear(y => y + 1); setMonth(1); }
    else setMonth(m => m + 1);
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      {viewingImage && <ImageViewer uri={viewingImage} onClose={() => setViewingImage(null)} />}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={({ pressed }) => [styles.headerBack, pressed && { opacity: 0.5 }]}>
          <ChevronLeft size={24} color="#191f28" />
        </Pressable>
        <Text style={styles.headerTitle}>{nickname}님의 가계부</Text>
        <View style={{ width: 44 }} />
      </View>

      <View style={styles.monthRow}>
        <Pressable onPress={prevMonth} style={({ pressed }) => [styles.monthBtn, pressed && { opacity: 0.5 }]}>
          <Prev size={20} color="#8b95a1" />
        </Pressable>
        <Text style={styles.monthText}>{year}년 {month}월</Text>
        <Pressable onPress={nextMonth} style={({ pressed }) => [styles.monthBtn, pressed && { opacity: 0.5 }]}>
          <Next size={20} color="#8b95a1" />
        </Pressable>
      </View>

      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>이번 달 지출</Text>
        <Text style={styles.summaryAmount}>{totalExpense.toLocaleString()}원</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}>
        {isLoading ? (
          <Text style={styles.empty}>불러오는 중...</Text>
        ) : grouped.length === 0 ? (
          <Text style={styles.empty}>공개된 지출이 없어요</Text>
        ) : (
          grouped.map(([date, items]) => (
            <View key={date} style={styles.dateGroup}>
              <Text style={styles.dateLabel}>
                {format(parseISO(date), "M월 d일 (EEEEE)", { locale: ko })}
              </Text>
              <View style={styles.card}>
                {items.map((item, idx) => {
                  const color = getColor(item.categoryGroup);
                  return (
                    <View key={item.id}>
                      {idx > 0 && <View style={styles.divider} />}
                      <View style={styles.row}>
                        <View style={{ position: "relative" }}>
                          <View style={[styles.iconBox, { backgroundColor: color }]}>
                            <CategoryIcon emoji={getIcon(item.categoryGroup)} color="#fff" isWhite size={16} />
                          </View>
                          {item.imageUrl && (
                            <View style={styles.imageBadge}>
                              <Camera size={8} color="#fff" strokeWidth={2.5} />
                            </View>
                          )}
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.categoryName}>{item.memo || item.categoryName}</Text>
                          {(item.memo || item.createdAt) && (
                            <Text style={styles.memo} numberOfLines={1}>
                              {[item.memo ? item.categoryName : null, item.createdAt ? format(parseISO(item.createdAt), "a h:mm", { locale: ko }) : null]
                                .filter(Boolean).join("  ·  ")}
                            </Text>
                          )}
                        </View>
                        <Text style={[styles.amount, item.type === "INCOME" && styles.income]}>
                          {item.type === "INCOME" ? "+" : "-"}{item.amount.toLocaleString()}원
                        </Text>
                      </View>
                      {item.imageUrl && (
                        <Pressable onPress={() => setViewingImage(item.imageUrl!)} style={({ pressed }) => [pressed && { opacity: 0.85 }]}>
                          <Image source={{ uri: item.imageUrl }} style={styles.image} resizeMode="cover" />
                        </Pressable>
                      )}
                    </View>
                  );
                })}
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f9fafb" },
  header: {
    height: 56, flexDirection: "row", alignItems: "center",
    justifyContent: "space-between", paddingHorizontal: 8, backgroundColor: "#f9fafb",
  },
  headerBack: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 17, fontWeight: "700", color: "#191f28" },

  monthRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 16, paddingVertical: 12 },
  monthBtn: { padding: 8 },
  monthText: { fontSize: 16, fontWeight: "700", color: "#191f28", minWidth: 100, textAlign: "center" },

  summaryRow: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 20, paddingBottom: 12,
  },
  summaryLabel: { fontSize: 13, color: "#8b95a1", fontWeight: "500" },
  summaryAmount: { fontSize: 18, fontWeight: "700", color: "#191f28" },

  empty: { textAlign: "center", color: "#adb5bd", fontSize: 14, paddingVertical: 60 },

  dateGroup: { marginBottom: 16 },
  dateLabel: { fontSize: 12, fontWeight: "700", color: "#8b95a1", marginBottom: 6, marginLeft: 4 },
  card: { backgroundColor: "#fff", borderRadius: 16, borderWidth: 1, borderColor: "#f2f4f6", overflow: "hidden" },
  divider: { height: 1, backgroundColor: "#f2f4f6", marginLeft: 64 },
  row: { flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingVertical: 12, gap: 10 },
  iconBox: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  imageBadge: {
    position: "absolute", bottom: -2, right: -2,
    width: 15, height: 15, borderRadius: 8,
    backgroundColor: "#3182f6", borderWidth: 1.5, borderColor: "#fff",
    alignItems: "center", justifyContent: "center",
  },
  categoryName: { fontSize: 14, fontWeight: "600", color: "#191f28" },
  memo: { fontSize: 12, color: "#8b95a1", marginTop: 2 },
  amount: { fontSize: 14, fontWeight: "700", color: "#191f28" },
  income: { color: "#3182f6" },
  image: { width: "100%", height: 180 },
});
