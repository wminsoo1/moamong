import { useState } from "react";
import { View, Text, Pressable, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { ChevronLeft, ChevronRight } from "lucide-react-native";
import { useCategoryGroups } from "@/src/features/user/queries/useCategoryGroups";
import { EXPENSE_GROUPS, INCOME_GROUPS } from "@/src/features/user/types";
import { CategoryIcon } from "@/src/components/CategoryIcon";

export default function CategoryGroupManagementScreen() {
  const [catType, setCatType] = useState<"EXPENSE" | "INCOME">("EXPENSE");
  const { data: allGroups = [] } = useCategoryGroups();

  const typeKeys = catType === "EXPENSE" ? EXPENSE_GROUPS : INCOME_GROUPS;
  const groups = allGroups
    .filter((g) => typeKeys.includes(g.groupKey))
    .sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.5 }]}>
          <ChevronLeft size={28} color="#191f28" />
        </Pressable>
        <Text style={styles.headerTitle}>카테고리 수정</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.tabRow}>
        <View style={styles.tabContainer}>
          {(["EXPENSE", "INCOME"] as const).map((t) => (
            <Pressable
              key={t}
              onPress={() => setCatType(t)}
              style={[styles.tabBtn, catType === t && styles.tabBtnActive]}
            >
              <Text style={[styles.tabBtnText, catType === t && styles.tabBtnTextActive]}>
                {t === "EXPENSE" ? "지출" : "수입"}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.groupCard}>
          {groups.map((g, idx) => (
            <Pressable
              key={g.groupKey}
              onPress={() => router.push({
                pathname: "/category-group-edit",
                params: { group: g.groupKey }
              })}
              style={({ pressed }) => [
                styles.catItem,
                idx > 0 && styles.catItemBorder,
                pressed && { backgroundColor: "#f9fafb" }
              ]}
            >
              <View style={[styles.catIcon, { backgroundColor: g.color }]}>
                <CategoryIcon emoji={g.icon} color={g.color} isWhite size={18} />
              </View>
              <Text style={styles.catName}>{g.label}</Text>
              <ChevronRight size={16} color="#c9cdd2" />
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f2f4f6" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#f2f4f6", backgroundColor: "#fff" },
  backBtn: { width: 40, height: 40, alignItems: "flex-start", justifyContent: "center" },
  headerTitle: { fontSize: 17, fontWeight: "700", color: "#191f28" },
  tabRow: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12, backgroundColor: "#f2f4f6" },
  tabContainer: { flexDirection: "row", backgroundColor: "#e5e8eb", borderRadius: 14, padding: 4 },
  tabBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: "center" },
  tabBtnActive: { backgroundColor: "#3182f6" },
  tabBtnText: { fontSize: 15, fontWeight: "700", color: "#adb5bd" },
  tabBtnTextActive: { color: "#fff" },
  scrollContent: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 40 },
  groupCard: { backgroundColor: "#fff", borderRadius: 16, overflow: "hidden" },
  catItem: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14, gap: 12 },
  catItemBorder: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: "#e5e8eb" },
  catIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  catName: { flex: 1, fontSize: 15, fontWeight: "600", color: "#191f28" },
});
