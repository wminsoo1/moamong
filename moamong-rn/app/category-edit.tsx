import { useState } from "react";
import {
  View, Text, ScrollView, Pressable, TextInput,
  StyleSheet, KeyboardAvoidingView, Platform, Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useUpdateCategory } from "@/src/features/user/mutations/useUpdateCategory";
import { useDeleteCategory } from "@/src/features/user/mutations/useDeleteCategory";
import { useLocalSearchParams, router } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { CategoryIcon } from "@/src/components/CategoryIcon";
import { CategoryGroup } from "@/src/features/user/types";
import { useGroupSettings } from "@/src/features/user/hooks/useGroupSettings";
import { useUserCategories } from "@/src/features/user/queries/useUserCategories";

export default function CategoryEditScreen() {
  const { categoryId, initialName, initialType, initialGroup } = useLocalSearchParams<{
    categoryId: string;
    initialName: string;
    initialType: string;
    initialGroup: string;
  }>();
  const insets = useSafeAreaInsets();
  const { getLabel, getColor, getIcon } = useGroupSettings();
  const { userCategories } = useUserCategories();

  const catGroup = initialGroup as CategoryGroup;
  const catType = initialType as "EXPENSE" | "INCOME";
  const [catName, setCatName] = useState(initialName ?? "");
  const [catError, setCatError] = useState("");

  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const currentColor = getColor(catGroup);
  const currentIcon = getIcon(catGroup);

  const siblingCategories = userCategories.filter(
    (c) => c.parentGroup === catGroup && c.type === catType && c.id !== Number(categoryId)
  );

  const handleDelete = () => {
    Alert.alert("항목 삭제", `"${initialName}" 항목을 삭제할까요?`, [
      { text: "취소", style: "cancel" },
      { text: "삭제", style: "destructive", onPress: () => deleteCategory.mutate(Number(categoryId), { onSuccess: () => router.back() }) },
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#ffffff" }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <View style={[styles.header, { paddingTop: insets.top + 8, height: insets.top + 60, paddingHorizontal: 20 }]}>
          <View style={{ flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <Pressable onPress={() => router.back()} style={({ pressed }) => [styles.headerBtn, pressed && { opacity: 0.5 }]}>
              <ChevronLeft size={28} color="#191f28" />
            </Pressable>
            <Text style={styles.headerTitle}>항목 수정</Text>
            <Pressable onPress={handleDelete} style={({ pressed }) => [styles.deleteBtn, pressed && { opacity: 0.5 }]}>
              <Text style={styles.deleteBtnText}>삭제</Text>
            </Pressable>
          </View>
        </View>

        <ScrollView style={styles.scroll} keyboardShouldPersistTaps="handled">
          {/* 그룹 미리보기 */}
          <View style={styles.previewArea}>
            <View style={[styles.previewIcon, { backgroundColor: currentColor }]}>
              <CategoryIcon emoji={currentIcon} color={currentColor} isWhite size={28} />
            </View>
            <Text style={styles.previewGroupLabel}>{getLabel(catGroup)}</Text>
          </View>

          {/* 이름 입력 */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>항목 이름</Text>
            <TextInput
              style={styles.nameInput}
              placeholder="이름을 입력하세요"
              placeholderTextColor="#c9cdd2"
              value={catName}
              onChangeText={setCatName}
              maxLength={10}
              autoFocus
            />
          </View>

          {/* 같은 그룹의 다른 항목 */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>같은 분류의 다른 항목</Text>
            <View style={styles.siblingCard}>
              {siblingCategories.length === 0 ? (
                <Text style={styles.emptySiblings}>다른 항목이 없어요</Text>
              ) : (
                <View style={styles.siblingChips}>
                  {siblingCategories.map((c) => (
                    <View key={c.id} style={[styles.siblingChip, { borderColor: currentColor + "40" }]}>
                      <Text style={[styles.siblingChipText, { color: currentColor }]}>{c.name}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          {catError ? <Text style={styles.errorText}>{catError}</Text> : null}
          <Pressable
            disabled={!catName.trim() || updateCategory.isPending}
            onPress={() => {
              setCatError("");
              updateCategory.mutate(
                { categoryId: Number(categoryId), name: catName.trim() },
                { onSuccess: () => router.back(), onError: (e: Error) => setCatError(e.message) }
              );
            }}
            style={({ pressed }) => [
              styles.submitBtn,
              { backgroundColor: currentColor },
              !catName.trim() && styles.btnDisabled,
              pressed && { opacity: 0.8 },
            ]}
          >
            <Text style={styles.submitText}>{updateCategory.isPending ? "저장 중..." : "저장하기"}</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#f2f4f6", justifyContent: "center" },
  headerBtn: { width: 40, height: 40, alignItems: "flex-start", justifyContent: "center" },
  headerTitle: { fontSize: 17, fontWeight: "700", color: "#191f28", textAlign: "center" },
  deleteBtn: { width: 40, height: 40, alignItems: "flex-end", justifyContent: "center" },
  deleteBtnText: { fontSize: 14, fontWeight: "600", color: "#f04452" },
  scroll: { flex: 1, paddingHorizontal: 20, paddingTop: 24 },
  section: { marginBottom: 24 },
  sectionLabel: { fontSize: 12, fontWeight: "700", color: "#adb5bd", textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 },
  previewArea: { alignItems: "center", marginBottom: 28 },
  previewIcon: { width: 64, height: 64, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  previewGroupLabel: { fontSize: 13, fontWeight: "600", color: "#8b95a1", marginTop: 8 },
  nameInput: { height: 48, paddingHorizontal: 16, borderRadius: 12, borderWidth: 1, borderColor: "#e5e8eb", backgroundColor: "#fff", fontSize: 15, fontWeight: "600", color: "#191f28" },
  siblingCard: { backgroundColor: "#f9fafb", borderRadius: 14, padding: 14 },
  siblingChips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  siblingChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: "#fff", borderWidth: 1 },
  siblingChipText: { fontSize: 13, fontWeight: "600" },
  emptySiblings: { fontSize: 13, color: "#adb5bd", textAlign: "center" },
  footer: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 16, backgroundColor: "#fff", borderTopWidth: 1, borderTopColor: "#f2f4f6" },
  submitBtn: { height: 52, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  submitText: { fontSize: 16, fontWeight: "700", color: "#fff" },
  btnDisabled: { opacity: 0.3 },
  errorText: { fontSize: 12, color: "#f04452", textAlign: "center", marginBottom: 8 },
});
