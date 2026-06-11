import {
  View, Text, Pressable, ScrollView,
  KeyboardAvoidingView, StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { parseISO, format } from "date-fns";
import { ko } from "date-fns/locale";
import { ChevronLeft } from "lucide-react-native";
import { ExpenseFormFields } from "@/src/components/ExpenseFormFields";
import { useUserCategories } from "@/src/features/user/queries/useUserCategories";
import { useCreateSpending } from "@/src/features/spending/mutations/useCreateSpending";
import { useImageUpload } from "@/src/features/spending/hooks/useImageUpload";
import { useState } from "react";

export default function AddExpenseScreen() {
  const { date } = useLocalSearchParams<{ date?: string }>();
  const selectedDate = date ? parseISO(date) : new Date();

  const [expType, setExpType] = useState<"지출" | "수입">("지출");
  const [expAmount, setExpAmount] = useState("");
  const [expMemo, setExpMemo] = useState("");
  const [expCategoryId, setExpCategoryId] = useState<number | null>(null);
  const [expGroupKey, setExpGroupKey] = useState<string | null>(null);

  const { userCategories } = useUserCategories();
  const createSpending = useCreateSpending();
  const { imageUri, imageUrl, uploading, pick, pickFromCamera, remove } = useImageUpload();

  const canSubmit = expAmount !== "" && parseInt(expAmount, 10) > 0 && (expCategoryId !== null || expGroupKey !== null) && !uploading;

  const handleSave = () => {
    createSpending.mutate(
      {
        type: expType === "지출" ? "EXPENSE" : "INCOME",
        categoryId: expCategoryId ?? undefined,
        categoryGroupKey: expCategoryId === null ? expGroupKey ?? undefined : undefined,
        amount: parseInt(expAmount, 10),
        date: format(selectedDate, "yyyy-MM-dd"),
        memo: expMemo || null,
        imageUrl: imageUrl ?? null,
      },
      { onSuccess: () => router.back() }
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={({ pressed }) => [styles.headerSideBtn, pressed && { opacity: 0.5 }]}>
          <ChevronLeft size={28} color="#191f28" />
        </Pressable>
        <Text style={styles.headerTitle}>거래 내역 추가하기</Text>
        <View style={{ width: 44 }} />
      </View>

      <Text style={styles.dateSub}>{format(selectedDate, "M월 d일 (eee)", { locale: ko })}</Text>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
        <ScrollView style={styles.scroll} keyboardShouldPersistTaps="handled">
          <ExpenseFormFields
            expType={expType}
            expAmount={expAmount}
            expMemo={expMemo}
            expCategoryId={expCategoryId}
            userCategories={userCategories}
            imageUri={imageUri}
            uploading={uploading}
            onChangeType={(type, firstCategoryId) => { setExpType(type); setExpCategoryId(firstCategoryId); setExpGroupKey(null); }}
            onChangeAmount={setExpAmount}
            onChangeMemo={setExpMemo}
            onChangeCategoryId={setExpCategoryId}
            onChangeGroupKey={setExpGroupKey}
            onPickImage={pick}
            onPickCamera={pickFromCamera}
            onRemoveImage={remove}
          />
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={styles.footer}>
        {createSpending.error && (
          <Text style={styles.errorText}>{(createSpending.error as Error).message || "저장 중 오류가 발생했습니다."}</Text>
        )}
        <Pressable
          disabled={!canSubmit || createSpending.isPending}
          onPress={handleSave}
          style={({ pressed }) => [styles.primaryBtn, (!canSubmit || createSpending.isPending) && styles.btnDisabled, pressed && { opacity: 0.8 }]}
        >
          <Text style={styles.primaryBtnText}>{createSpending.isPending ? "저장 중..." : "기록하기"}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#ffffff" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, height: 56, borderBottomWidth: 1, borderBottomColor: "#f2f4f6" },
  headerSideBtn: { width: 44, height: 44, alignItems: "flex-start", justifyContent: "center" },
  headerTitle: { fontSize: 17, fontWeight: "700", color: "#191f28" },
  dateSub: { textAlign: "center", fontSize: 17, fontWeight: "600", color: "#191f28", paddingVertical: 10 },
  scroll: { flex: 1, paddingHorizontal: 20 },
  footer: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 20, borderTopWidth: 1, borderTopColor: "#f2f4f6", gap: 8 },
  errorText: { fontSize: 12, color: "#f04452", textAlign: "center" },
  primaryBtn: { height: 52, borderRadius: 16, backgroundColor: "#3182f6", alignItems: "center", justifyContent: "center" },
  primaryBtnText: { fontSize: 16, fontWeight: "700", color: "#fff" },
  btnDisabled: { opacity: 0.3 },
});
