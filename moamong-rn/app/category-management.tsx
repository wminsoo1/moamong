import { useState, useEffect } from "react";
import { View, Text, Pressable, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { ChevronLeft, Plus, ChevronUp, ChevronDown, ChevronRight } from "lucide-react-native";
import { useUserCategories } from "@/src/features/user/queries/useUserCategories";
import { useReorderCategories } from "@/src/features/user/mutations/useReorderCategories";
import { CategoryIcon } from "@/src/components/CategoryIcon";
import { UserCategory, CategoryGroup, EXPENSE_GROUPS, INCOME_GROUPS } from "@/src/features/user/types";
import { useGroupSettings } from "@/src/features/user/hooks/useGroupSettings";

export default function CategoryManagementScreen() {
  const [catType, setCatType] = useState<"EXPENSE" | "INCOME">("EXPENSE");
  const [isEditing, setIsEditing] = useState(false);
  const { userCategories } = useUserCategories();
  const reorderCategories = useReorderCategories();
  const { getLabel, getColor, getIcon } = useGroupSettings();

  const [localFiltered, setLocalFiltered] = useState(
    userCategories.filter((c) => c.type === catType)
  );

  useEffect(() => {
    setLocalFiltered(userCategories.filter((c) => c.type === catType));
  }, [userCategories, catType]);

  // 그룹 내에서만 순서 변경
  const move = (groupCats: UserCategory[], catInGroup: UserCategory, direction: "up" | "down") => {
    const groupIndex = groupCats.indexOf(catInGroup);
    const nextGroupIndex = direction === "up" ? groupIndex - 1 : groupIndex + 1;
    if (nextGroupIndex < 0 || nextGroupIndex >= groupCats.length) return;

    const updated = [...localFiltered];
    const idxA = updated.findIndex((c) => c.id === groupCats[groupIndex].id);
    const idxB = updated.findIndex((c) => c.id === groupCats[nextGroupIndex].id);
    [updated[idxA], updated[idxB]] = [updated[idxB], updated[idxA]];
    setLocalFiltered(updated);
    reorderCategories.mutate(updated.map((c) => c.id));
  };

  // 타입에 맞는 그룹만, 항목 있는 것 우선 + 빈 것도 표시
  const groupOrder = catType === "EXPENSE" ? EXPENSE_GROUPS : INCOME_GROUPS;
  const groups = groupOrder.map((g) => {
    const groupCats = localFiltered.filter((c) => c.parentGroup === g);
    // '기타'로 시작하는 항목을 맨 뒤로 정렬
    const sortedCats = [...groupCats].sort((a, b) => {
      const aIsEtc = a.name.startsWith("기타");
      const bIsEtc = b.name.startsWith("기타");
      if (aIsEtc && !bIsEtc) return 1;
      if (!aIsEtc && bIsEtc) return -1;
      return 0; // 기존 순서 유지 (이미 sortOrder로 정렬되어 있다고 가정)
    });

    return {
      group: g,
      label: getLabel(g),
      color: getColor(g),
      icon: getIcon(g),
      cats: sortedCats,
    };
  });

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.5 }]}>
          <ChevronLeft size={28} color="#191f28" />
        </Pressable>
        <Text style={styles.headerTitle}>세부 항목</Text>
        <Pressable
          onPress={() => setIsEditing((v) => !v)}
          style={({ pressed }) => [styles.editBtn, pressed && { opacity: 0.6 }]}
        >
          <Text style={[styles.editBtnText, isEditing && styles.editBtnTextActive]}>
            {isEditing ? "완료" : "편집"}
          </Text>
        </Pressable>
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

      {localFiltered.length === 0 ? (
        <Text style={styles.emptyText}>카테고리가 없어요</Text>
      ) : (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {groups.map(({ group, label, color, icon, cats }) => (
            <View key={group} style={styles.groupSection}>
              <View style={styles.groupHeader}>
                <View style={[styles.groupIcon, { backgroundColor: color }]}>
                  <CategoryIcon emoji={icon} color={color} isWhite size={12} />
                </View>
                <Text style={[styles.groupLabel, { flex: 1 }]}>{label}</Text>
              </View>
              <View style={styles.groupCard}>
                {cats.map((cat, idx) => (
                  <View key={cat.id} style={[styles.catItem, idx > 0 && styles.catItemBorder]}>
                    <Pressable
                      onPress={() => !isEditing && router.push({
                        pathname: "/category-edit",
                        params: {
                          categoryId: String(cat.id),
                          initialName: cat.name,
                          initialType: cat.type,
                          initialGroup: cat.parentGroup,
                        },
                      })}
                      style={styles.catRow}
                    >
                      <Text style={styles.catName}>{cat.name}</Text>
                      {!isEditing && <ChevronRight size={16} color="#c9cdd2" />}
                    </Pressable>

                    {isEditing && (
                      <View style={styles.arrowBtns}>
                        <Pressable
                          onPress={() => move(cats, cat, "up")}
                          disabled={idx === 0}
                          style={({ pressed }) => [styles.arrowBtn, pressed && { opacity: 0.4 }]}
                        >
                          <ChevronUp size={18} color={idx === 0 ? "#d1d5db" : "#3182f6"} />
                        </Pressable>
                        <Pressable
                          onPress={() => move(cats, cat, "down")}
                          disabled={idx === cats.length - 1}
                          style={({ pressed }) => [styles.arrowBtn, pressed && { opacity: 0.4 }]}
                        >
                          <ChevronDown size={18} color={idx === cats.length - 1 ? "#d1d5db" : "#3182f6"} />
                        </Pressable>
                      </View>
                    )}
                  </View>
                ))}

                {!isEditing && (
                  <Pressable
                    onPress={() => router.push({
                      pathname: "/category-add",
                      params: { group, type: catType }
                    })}
                    style={({ pressed }) => [
                      styles.inlineAddBtn,
                      cats.length > 0 && styles.catItemBorder,
                      pressed && { backgroundColor: "#f9fafb" }
                    ]}
                  >
                    <Plus size={14} color="#3182f6" strokeWidth={3} />
                    <Text style={styles.inlineAddBtnText}>추가하기</Text>
                  </Pressable>
                )}
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f2f4f6" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#f2f4f6", backgroundColor: "#fff" },
  backBtn: { width: 40, height: 40, alignItems: "flex-start", justifyContent: "center" },
  headerTitle: { fontSize: 17, fontWeight: "700", color: "#191f28" },
  editBtn: { paddingHorizontal: 4, height: 32, justifyContent: "center" },
  editBtnText: { fontSize: 15, fontWeight: "600", color: "#6b7280" },
  editBtnTextActive: { color: "#3182f6" },
  tabRow: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12, backgroundColor: "#f2f4f6" },
  tabContainer: { flexDirection: "row", backgroundColor: "#e5e8eb", borderRadius: 14, padding: 4 },
  tabBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: "center" },
  tabBtnActive: { backgroundColor: "#3182f6" },
  tabBtnText: { fontSize: 15, fontWeight: "700", color: "#adb5bd" },
  tabBtnTextActive: { color: "#fff" },
  emptyText: { textAlign: "center", color: "#adb5bd", fontSize: 14, paddingVertical: 40 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 40 },
  groupSection: { marginBottom: 20 },
  groupHeader: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 8, marginLeft: 4 },
  groupIcon: { width: 20, height: 20, borderRadius: 6, alignItems: "center", justifyContent: "center" },
  groupLabel: { fontSize: 13, fontWeight: "700", color: "#8b95a1", textTransform: "uppercase", letterSpacing: 0.5 },
  groupEditBtn: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, backgroundColor: "#f2f4f6" },
  groupEditBtnText: { fontSize: 11, fontWeight: "600", color: "#6b7280" },
  groupCard: { backgroundColor: "#fff", borderRadius: 16, overflow: "hidden" },
  catItem: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, backgroundColor: "#fff" },
  catItemBorder: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: "#e5e8eb" },
  catRow: { flex: 1, flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 14 },
  catName: { flex: 1, fontSize: 15, fontWeight: "600", color: "#191f28" },
  inlineAddBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 14,
    backgroundColor: "#fff",
  },
  inlineAddBtnText: { fontSize: 14, fontWeight: "700", color: "#3182f6" },
  arrowBtns: { flexDirection: "column" },
  arrowBtn: { padding: 4 },
});
