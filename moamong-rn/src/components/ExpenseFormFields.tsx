import { useState, useEffect } from "react";
import { View, Text, Pressable, TextInput, Image, ActivityIndicator, StyleSheet } from "react-native";
import { router } from "expo-router";
import { Plus, Camera, X } from "lucide-react-native";
import { CategoryIcon } from "@/src/components/CategoryIcon";
import { UserCategory, CategoryGroup, EXPENSE_GROUPS, INCOME_GROUPS } from "@/src/features/user/types";
import { useGroupSettings } from "@/src/features/user/hooks/useGroupSettings";

interface Props {
  expType: "지출" | "수입";
  expAmount: string;
  expMemo: string;
  expCategoryId: number | null;
  userCategories: UserCategory[];
  imageUri?: string | null;
  uploading?: boolean;
  onChangeType: (type: "지출" | "수입", firstCategoryId: number | null) => void;
  onChangeAmount: (amount: string) => void;
  onChangeMemo: (memo: string) => void;
  onChangeCategoryId: (id: number | null) => void;
  onChangeGroupKey?: (groupKey: CategoryGroup | null) => void;
  onPickImage?: () => void;
  onRemoveImage?: () => void;
}

export function ExpenseFormFields({
  expType, expAmount, expMemo, expCategoryId, userCategories,
  imageUri, uploading,
  onChangeType, onChangeAmount, onChangeMemo, onChangeCategoryId, onChangeGroupKey,
  onPickImage, onRemoveImage,
}: Props) {
  const expAmountDisplay = expAmount ? parseInt(expAmount, 10).toLocaleString() : "";
  const typeStr = expType === "지출" ? "EXPENSE" : "INCOME";
  const { getColor, getIcon, getLabel } = useGroupSettings();

  const filtered = userCategories.filter((c) => c.type === typeStr);

  const selectedCat = filtered.find((c) => c.id === expCategoryId);
  const [selectedGroup, setSelectedGroup] = useState<CategoryGroup | null>(
    selectedCat?.parentGroup ?? null
  );

  useEffect(() => {
    const cat = filtered.find((c) => c.id === expCategoryId);
    setSelectedGroup(cat?.parentGroup ?? null);
  }, [expType]);

  useEffect(() => {
    if (expCategoryId === null) return;
    const cat = filtered.find((c) => c.id === expCategoryId);
    if (cat) setSelectedGroup(cat.parentGroup);
  }, [expCategoryId]);

  const groupOrder = typeStr === "EXPENSE" ? EXPENSE_GROUPS : INCOME_GROUPS;
  const availableGroups = groupOrder.filter((g) => filtered.some((c) => c.parentGroup === g));

  const subCategories = selectedGroup
    ? filtered.filter((c) => c.parentGroup === selectedGroup)
    : [];

  return (
    <>
      <View style={styles.segmentRow}>
        {(["지출", "수입"] as const).map((type) => (
          <Pressable
            key={type}
            onPress={() => {
              const t = type === "지출" ? "EXPENSE" : "INCOME";
              const firstCat = userCategories.find((c) => c.type === t);
              setSelectedGroup(firstCat?.parentGroup ?? null);
              onChangeType(type, firstCat?.id ?? null);
            }}
            style={[styles.segmentBtn, expType === type && styles.segmentBtnActive]}
          >
            <Text style={[styles.segmentText, expType === type && styles.segmentTextActive]}>
              {type}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.inputRow}>
        <TextInput
          style={styles.amountInput}
          placeholder="금액을 입력하세요 (필수)"
          placeholderTextColor="#c9cdd2"
          keyboardType="numeric"
          value={expAmountDisplay}
          onChangeText={(t) => onChangeAmount(t.replace(/[^0-9]/g, ""))}
        />
        <Text style={styles.unitText}>원</Text>
      </View>

      <View style={styles.inputRow}>
        <TextInput
          style={styles.memoInput}
          placeholder="메모를 입력하세요 (선택)"
          placeholderTextColor="#c9cdd2"
          value={expMemo}
          onChangeText={onChangeMemo}
        />
      </View>

      {onPickImage && (
        <View style={styles.imageSection}>
          <Text style={styles.imageSectionLabel}>사진 <Text style={styles.optionalTag}>(선택)</Text></Text>
          {imageUri ? (
            <View style={styles.imagePreviewWrap}>
              <Image source={{ uri: imageUri }} style={styles.imagePreview} />
              {uploading ? (
                <View style={styles.imageOverlay}>
                  <ActivityIndicator color="#fff" />
                </View>
              ) : (
                <Pressable onPress={onRemoveImage} style={styles.imageRemoveBtn}>
                  <X size={12} color="#fff" strokeWidth={3} />
                </Pressable>
              )}
            </View>
          ) : (
            <Pressable
              onPress={onPickImage}
              style={({ pressed }) => [styles.imagePickerBtn, pressed && { opacity: 0.6 }]}
            >
              <Camera size={18} color="#8b95a1" />
              <Text style={styles.imagePickerText}>사진 추가</Text>
            </Pressable>
          )}
        </View>
      )}

      <View style={styles.catSection}>
        <View style={styles.catSectionHeader}>
          <Text style={styles.catSectionLabel}>
            카테고리 <Text style={{ color: "#f04452" }}>*</Text>
          </Text>
          <Pressable
            onPress={() => router.push(`/category-add?group=${selectedGroup ?? ""}&type=${typeStr}`)}
            style={({ pressed }) => [{ flexDirection: "row", alignItems: "center", gap: 4 }, pressed && { opacity: 0.6 }]}
          >
            <Plus size={12} color="#3182f6" strokeWidth={3} />
            <Text style={{ fontSize: 12, fontWeight: "700", color: "#3182f6" }}>추가하기</Text>
          </Pressable>
        </View>

        <View style={styles.groupChips}>
          {availableGroups.map((g) => {
            const isSelected = selectedGroup === g;
            const gColor = getColor(g);
            return (
              <Pressable
                key={g}
                onPress={() => {
                  setSelectedGroup(g);
                  onChangeCategoryId(null);
                  onChangeGroupKey?.(g);
                }}
                style={[styles.groupChip, isSelected && { backgroundColor: gColor }]}
              >
                <CategoryIcon
                  emoji={getIcon(g)}
                  color={isSelected ? "#fff" : gColor}
                  isWhite={isSelected}
                  size={13}
                />
                <Text style={[styles.groupChipText, isSelected && { color: "#fff" }]}>
                  {getLabel(g)}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {selectedGroup && (
          <>
            <View style={styles.divider} />
            <View style={styles.catChips}>
              {subCategories.map((cat) => {
                const isSelected = expCategoryId === cat.id;
                return (
                  <Pressable
                    key={cat.id}
                    onPress={() => onChangeCategoryId(cat.id)}
                    style={({ pressed }) => [
                      styles.catChip,
                      { backgroundColor: isSelected ? getColor(selectedGroup!) : "#f2f4f6" },
                      pressed && { opacity: 0.7 },
                    ]}
                  >
                    <Text style={[styles.catChipText, { color: isSelected ? "#fff" : "#4e5968" }]}>{cat.name}</Text>
                  </Pressable>
                );
              })}
            </View>
          </>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  segmentRow: { flexDirection: "row", backgroundColor: "#f2f4f6", borderRadius: 12, padding: 4, marginTop: 20, marginBottom: 24 },
  segmentBtn: { flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: "center" },
  segmentBtnActive: { backgroundColor: "#fff", shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 4, shadowOffset: { width: 0, height: 1 }, elevation: 1 },
  segmentText: { fontSize: 15, fontWeight: "700", color: "#adb5bd" },
  segmentTextActive: { color: "#191f28" },
  inputRow: { flexDirection: "row", alignItems: "center", borderBottomWidth: 1, borderBottomColor: "#e5e8eb", paddingBottom: 16, marginBottom: 20 },
  amountInput: { flex: 1, fontSize: 20, fontWeight: "600", color: "#191f28" },
  unitText: { fontSize: 20, fontWeight: "600", color: "#8b95a1", marginLeft: 4 },
  memoInput: { flex: 1, fontSize: 20, fontWeight: "600", color: "#191f28", paddingVertical: 0 },
  imageSection: { marginBottom: 20 },
  imageSectionLabel: { fontSize: 12, fontWeight: "700", color: "#adb5bd", textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 },
  optionalTag: { fontSize: 12, fontWeight: "600", color: "#c9cdd2", textTransform: "none", letterSpacing: 0 },
  imagePickerBtn: { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 12, paddingHorizontal: 16, borderRadius: 12, borderWidth: 1, borderColor: "#e5e8eb", borderStyle: "dashed", alignSelf: "flex-start" },
  imagePickerText: { fontSize: 14, fontWeight: "600", color: "#8b95a1" },
  imagePreviewWrap: { position: "relative", alignSelf: "flex-start" },
  imagePreview: { width: 80, height: 80, borderRadius: 12 },
  imageOverlay: { ...StyleSheet.absoluteFillObject, borderRadius: 12, backgroundColor: "rgba(0,0,0,0.4)", alignItems: "center", justifyContent: "center" },
  imageRemoveBtn: { position: "absolute", top: -6, right: -6, width: 20, height: 20, borderRadius: 10, backgroundColor: "#4e5968", alignItems: "center", justifyContent: "center" },
  catSection: { marginBottom: 24 },
  catSectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  catSectionLabel: { fontSize: 12, fontWeight: "700", color: "#adb5bd", textTransform: "uppercase", letterSpacing: 1 },
  groupChips: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 10 },
  divider: { height: 1, backgroundColor: "#f2f4f6", marginVertical: 10 },
  groupChip: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, backgroundColor: "#f2f4f6" },
  groupChipText: { fontSize: 13, fontWeight: "600", color: "#4e5968" },
  catChips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  catChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999 },
  catChipText: { fontSize: 13, fontWeight: "600" },
});
