import {
  View, Text, Pressable, ScrollView, StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { ChevronLeft, Plus, Repeat } from "lucide-react-native";
import { useRecurringSpendings } from "@/src/features/spending/queries/useRecurringSpendings";
import { useGroupSettings } from "@/src/features/user/hooks/useGroupSettings";

export default function RecurringSpendingsScreen() {
  const { recurringSpendings, isLoading } = useRecurringSpendings();
  const { getColor } = useGroupSettings();

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={({ pressed }) => [styles.headerSideBtn, pressed && { opacity: 0.5 }]}>
          <ChevronLeft size={28} color="#191f28" />
        </Pressable>
        <Text style={styles.headerTitle}>정기 지출</Text>
        <Pressable
          onPress={() => router.push("/add-recurring-spending")}
          style={({ pressed }) => [styles.headerSideBtn, { alignItems: "flex-end" }, pressed && { opacity: 0.5 }]}
        >
          <Plus size={24} color="#3182f6" />
        </Pressable>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <Text style={styles.emptyText}>불러오는 중...</Text>
        ) : recurringSpendings.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Repeat size={40} color="#e5e8eb" />
            <Text style={styles.emptyText}>등록된 정기 지출이 없어요</Text>
            <Text style={styles.emptySubText}>월세, 구독료 등을 추가해보세요</Text>
          </View>
        ) : (
          <View style={styles.card}>
            {recurringSpendings.map((item, idx) => (
              <View key={item.id}>
                {idx > 0 && <View style={styles.divider} />}
                <Pressable
                  onPress={() => router.push({ pathname: "/edit-recurring-spending/[id]", params: { id: item.id } })}
                  style={({ pressed }) => [styles.row, pressed && { backgroundColor: "#f9fafb" }]}
                >
                  <View style={[styles.dayBadge, { backgroundColor: getColor(item.categoryGroup as any) + "20" }]}>
                    <Text style={[styles.dayText, { color: getColor(item.categoryGroup as any) }]}>
                      {item.dayOfMonth}일
                    </Text>
                  </View>

                  <View style={styles.rowContent}>
                    <Text style={styles.rowTitle} numberOfLines={1}>{item.memo ?? item.categoryName}</Text>
                    {item.categoryName !== item.categoryGroupLabel && (
                      <Text style={styles.rowSub} numberOfLines={1}>{item.categoryGroupLabel}</Text>
                    )}
                    <Text style={styles.rowDateRange} numberOfLines={1}>
                      {item.startDate} ~ {item.endDate ?? "무기한"}
                    </Text>
                  </View>

                  <Text style={[styles.rowAmount, item.type === "INCOME" && { color: "#3182f6" }]} numberOfLines={1}>
                    {item.type === "INCOME" ? "+" : "-"}{item.amount.toLocaleString()}원
                  </Text>
                </Pressable>
              </View>
            ))}
          </View>
        )}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f9fafb" },

  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, height: 56, backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#f2f4f6" },
  headerSideBtn: { width: 44, height: 44, alignItems: "flex-start", justifyContent: "center" },
  headerTitle: { fontSize: 17, fontWeight: "700", color: "#191f28" },

  scroll: { flex: 1, paddingHorizontal: 20, paddingTop: 16 },

  emptyWrap: { alignItems: "center", paddingTop: 80, gap: 8 },
  emptyText: { fontSize: 14, color: "#adb5bd", textAlign: "center" },
  emptySubText: { fontSize: 12, color: "#c9cdd2" },

  card: { backgroundColor: "#fff", borderRadius: 16, borderWidth: 1, borderColor: "#f2f4f6", overflow: "hidden" },
  divider: { height: 1, backgroundColor: "#f2f4f6" },
  row: { flexDirection: "row", alignItems: "flex-start", gap: 12, paddingHorizontal: 16, paddingVertical: 14 },

  dayBadge: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  dayText: { fontSize: 13, fontWeight: "700" },

  rowContent: { flex: 1 },
  rowTitle: { fontSize: 14, fontWeight: "600", color: "#191f28" },
  rowSub: { fontSize: 11, color: "#8b95a1", marginTop: 2 },
  rowDateRange: { fontSize: 11, color: "#b0b8c1", marginTop: 2 },

  rowAmount: { fontSize: 14, fontWeight: "700", color: "#f04452" },
});
