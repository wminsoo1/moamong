import { useState } from "react";
import {
  View, Text, ScrollView, Pressable, TextInput,
  StyleSheet, KeyboardAvoidingView, Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useCreateCategory } from "@/src/features/user/mutations/useCreateCategory";
import { useLocalSearchParams, router } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { CategoryGroup, EXPENSE_GROUPS, INCOME_GROUPS } from "@/src/features/user/types";
import { CategoryIcon } from "@/src/components/CategoryIcon";
import { useGroupSettings } from "@/src/features/user/hooks/useGroupSettings";
import { useUserCategories } from "@/src/features/user/queries/useUserCategories";

export default function CategoryAddScreen() {
  const { group: groupParam, type: typeParam } = useLocalSearchParams<{ group?: string; type?: string }>();
  const insets = useSafeAreaInsets();
  const { getColor, getIcon, getLabel } = useGroupSettings();

  const [catType, setCatType] = useState<"EXPENSE" | "INCOME">(
    (typeParam as "EXPENSE" | "INCOME") ?? "EXPENSE"
  );
  const [catGroup, setCatGroup] = useState<CategoryGroup>(
    (groupParam as CategoryGroup) ?? (typeParam === "INCOME" ? "EMPLOYMENT" : "FOOD")
  );
  const [catName, setCatName] = useState("");
  const [catError, setCatError] = useState("");

  const createCategory = useCreateCategory();
  const { userCategories } = useUserCategories();

  const availableGroups = catType === "EXPENSE" ? EXPENSE_GROUPS : INCOME_GROUPS;

  const siblingCategories = userCategories.filter(
    (c) => c.parentGroup === catGroup && c.type === catType
  );

  const handleTypeChange = (t: "EXPENSE" | "INCOME") => {
    setCatType(t);
    setCatGroup(t === "EXPENSE" ? "FOOD" : "EMPLOYMENT");
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#ffffff" }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <View style={[styles.header, { paddingTop: insets.top + 8, height: insets.top + 60 }]}>
          <Pressable onPress={() => router.back()} style={({ pressed }) => [styles.headerBtn, pressed && { opacity: 0.5 }]}>
            <ChevronLeft size={28} color="#191f28" />
          </Pressable>
          <Text style={styles.headerTitle}>항목 추가</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView style={styles.scroll} keyboardShouldPersistTaps="handled">

          {/* 미리보기 */}
          <View style={styles.previewArea}>
            <View style={[styles.previewIcon, { backgroundColor: getColor(catGroup) }]}>
              <CategoryIcon emoji={getIcon(catGroup)} color="#fff" isWhite size={32} />
            </View>
            <Text style={styles.previewGroupLabel}>{getLabel(catGroup)}</Text>
            {catName.trim() ? (
              <Text style={styles.previewCatName}>{catName}</Text>
            ) : (
              <Text style={styles.previewHint}>카테고리 이름을 입력하세요</Text>
            )}
          </View>

          {/* 지출 / 수입 */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>종류</Text>
            <View style={styles.tabRow}>
              {(["EXPENSE", "INCOME"] as const).map((t) => (
                <Pressable key={t} onPress={() => handleTypeChange(t)}
                  style={[styles.tabBtn, catType === t && styles.tabBtnActive]}>
                  <Text style={[styles.tabText, catType === t && styles.tabTextActive]}>
                    {t === "EXPENSE" ? "지출" : "수입"}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* 상위 카테고리 */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>상위 카테고리</Text>
            <View style={styles.chips}>
              {availableGroups.map((g) => {
                const isSelected = catGroup === g;
                const gColor = getColor(g);
                return (
                  <Pressable key={g} onPress={() => setCatGroup(g)}
                    style={[styles.chip, isSelected && { backgroundColor: gColor }]}>
                    <CategoryIcon emoji={getIcon(g)} color={isSelected ? "#fff" : gColor} isWhite={isSelected} size={13} />
                    <Text style={[styles.chipText, isSelected && { color: "#fff" }]}>
                      {getLabel(g)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* 카테고리 이름 */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>항목 이름</Text>
            <TextInput
              style={styles.nameInput}
              placeholder="이름을 입력하세요 (최대 10자)"
              placeholderTextColor="#c9cdd2"
              value={catName}
              onChangeText={setCatName}
              maxLength={10}
            />
          </View>

          {/* 같은 분류의 기존 항목 */}
          <View style={[styles.section, { marginBottom: 8 }]}>
            <Text style={styles.sectionLabel}>같은 분류의 기존 항목</Text>
            <View style={styles.siblingCard}>
              {siblingCategories.length === 0 ? (
                <Text style={styles.emptySiblings}>아직 항목이 없어요</Text>
              ) : (
                <View style={styles.siblingChips}>
                  {siblingCategories.map((c) => (
                    <View key={c.id} style={[styles.siblingChip, { borderColor: getColor(catGroup) + "40" }]}>
                      <Text style={[styles.siblingChipText, { color: getColor(catGroup) }]}>{c.name}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>

        </ScrollView>

        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          {catError ? <Text style={styles.errorText}>{catError}</Text> : null}
          <Pressable
            disabled={!catName.trim() || createCategory.isPending}
            onPress={() => {
              setCatError("");
              createCategory.mutate(
                { name: catName.trim(), type: catType, parentGroup: catGroup },
                { onSuccess: () => router.back(), onError: (e: Error) => setCatError(e.message) }
              );
            }}
            style={({ pressed }) => [
              styles.submitBtn,
              { backgroundColor: getColor(catGroup) },
              !catName.trim() && styles.btnDisabled,
              pressed && { opacity: 0.8 },
            ]}
          >
            <Text style={styles.submitText}>{createCategory.isPending ? "추가 중..." : "추가하기"}</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#f2f4f6", flexDirection: "row", alignItems: "center", paddingHorizontal: 20 },
  headerBtn: { width: 40, height: 40, alignItems: "flex-start", justifyContent: "center" },
  headerTitle: { flex: 1, fontSize: 17, fontWeight: "700", color: "#191f28", textAlign: "center" },
  scroll: { flex: 1, paddingHorizontal: 20, paddingTop: 24 },
  section: { marginBottom: 28 },
  sectionLabel: { fontSize: 12, fontWeight: "700", color: "#adb5bd", textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 },
  previewArea: { alignItems: "center", marginBottom: 32 },
  previewIcon: { width: 72, height: 72, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  previewGroupLabel: { fontSize: 12, fontWeight: "600", color: "#adb5bd", marginTop: 10 },
  previewCatName: { fontSize: 18, fontWeight: "800", color: "#191f28", marginTop: 4 },
  previewHint: { fontSize: 14, color: "#c9cdd2", marginTop: 4 },
  tabRow: { flexDirection: "row", backgroundColor: "#fff", borderRadius: 16, padding: 4, borderWidth: 1, borderColor: "#f2f4f6" },
  tabBtn: { flex: 1, paddingVertical: 10, borderRadius: 12, alignItems: "center" },
  tabBtnActive: { backgroundColor: "#3182f6" },
  tabText: { fontSize: 15, fontWeight: "700", color: "#adb5bd" },
  tabTextActive: { color: "#fff" },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, backgroundColor: "#f2f4f6" },
  chipText: { fontSize: 13, fontWeight: "600", color: "#4e5968" },
  nameInput: { height: 48, paddingHorizontal: 16, borderRadius: 12, borderWidth: 1, borderColor: "#e5e8eb", backgroundColor: "#fff", fontSize: 15, fontWeight: "600", color: "#191f28" },
  footer: { paddingHorizontal: 20, paddingTop: 12, backgroundColor: "#fff", borderTopWidth: 1, borderTopColor: "#f2f4f6" },
  submitBtn: { height: 52, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  submitText: { fontSize: 16, fontWeight: "700", color: "#fff" },
  btnDisabled: { opacity: 0.3 },
  errorText: { fontSize: 12, color: "#f04452", textAlign: "center", marginBottom: 8 },
  siblingCard: { backgroundColor: "#f9fafb", borderRadius: 14, padding: 14 },
  siblingChips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  siblingChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: "#fff", borderWidth: 1 },
  siblingChipText: { fontSize: 13, fontWeight: "600" },
  emptySiblings: { fontSize: 13, color: "#adb5bd", textAlign: "center" },
});
