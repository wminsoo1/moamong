import { useState, useEffect } from "react";
import { View, Text, Pressable, ScrollView, KeyboardAvoidingView, Alert, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { parseISO, format } from "date-fns";
import { ko } from "date-fns/locale";
import { ChevronLeft, X } from "lucide-react-native";
import { useUpdateSpending } from "@/src/features/spending/mutations/useUpdateSpending";
import { useDeleteSpending } from "@/src/features/spending/mutations/useDeleteSpending";
import { useSpendingFromCache } from "@/src/features/spending/queries/useSpendingFromCache";
import { useUserCategories } from "@/src/features/user/queries/useUserCategories";
import { useImageUpload } from "@/src/features/spending/hooks/useImageUpload";
import { ExpenseFormFields } from "@/src/components/ExpenseFormFields";

export default function EditExpenseScreen() {
  const { id, date } = useLocalSearchParams<{ id: string; date?: string }>();

  const selectedDate = date ? parseISO(date) : new Date();
  const initialExpense = useSpendingFromCache(Number(id), selectedDate);

  const [expType, setExpType] = useState<"지출" | "수입">(
    initialExpense?.type === "INCOME" ? "수입" : "지출"
  );
  const [expAmount, setExpAmount] = useState(initialExpense?.amount.toString() ?? "");
  const [expMemo, setExpMemo] = useState(initialExpense?.memo ?? "");
  const [expCategoryId, setExpCategoryId] = useState<number | null>(null);
  const [expGroupKey, setExpGroupKey] = useState<string | null>(
    initialExpense?.categoryGroup ?? null
  );

  const { userCategories } = useUserCategories();
  const { imageUri, imageUrl, uploading, pick, remove } = useImageUpload(initialExpense?.imageUrl);

  useEffect(() => {
    if (userCategories.length === 0 || !initialExpense) return;
    const cat = userCategories.find(
      (c) => c.name === initialExpense.categoryName && c.type === initialExpense.type
    );
    setExpCategoryId(cat?.id ?? null);
    if (!cat) setExpGroupKey(initialExpense.categoryGroup ?? null);
  }, [userCategories]);

  const updateSpending = useUpdateSpending(Number(id));
  const deleteSpending = useDeleteSpending();

  const canSubmit = expAmount !== "" && parseInt(expAmount, 10) > 0 && (expCategoryId !== null || expGroupKey !== null) && !uploading;

  const mutationError = updateSpending.error || deleteSpending.error;

  if (!initialExpense) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.headerSideBtn}>
            <ChevronLeft size={28} color="#191f28" />
          </Pressable>
          <Text style={styles.headerTitle}>거래 내역 수정</Text>
          <View style={{ width: 44 }} />
        </View>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <Text style={{ color: "#adb5bd", fontSize: 14 }}>데이터를 찾을 수 없어요</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={({ pressed }) => [styles.headerSideBtn, pressed && { opacity: 0.5 }]}>
          <ChevronLeft size={28} color="#191f28" />
        </Pressable>
        <Text style={styles.headerTitle}>거래 내역 수정</Text>
        <Pressable
          onPress={() =>
            Alert.alert("삭제", "삭제하시겠습니까?", [
              { text: "취소", style: "cancel" },
              {
                text: "삭제", style: "destructive",
                onPress: () => deleteSpending.mutate(
                  { spendingId: Number(id), date: format(selectedDate, "yyyy-MM-dd") },
                  { onSuccess: () => router.back() }
                ),
              },
            ])
          }
          style={({ pressed }) => [styles.headerSideBtn, { alignItems: "flex-end" }, pressed && { opacity: 0.5 }]}
        >
          <X size={20} color="#f04452" />
        </Pressable>
      </View>

      <Text style={styles.dateSub}>{format(selectedDate, "M월 d일 (eee)", { locale: ko })}</Text>
      {initialExpense.createdAt && (
        <Text style={styles.timeSub}>
          {format(parseISO(initialExpense.createdAt), "a h:mm", { locale: ko })}에 기록됨
        </Text>
      )}

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
            onChangeGroupKey={(g) => setExpGroupKey(g)}
            onPickImage={pick}
            onRemoveImage={remove}
          />
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={styles.footer}>
        {mutationError && <Text style={styles.errorText}>{(mutationError as Error).message || "오류가 발생했습니다."}</Text>}
        <Pressable
          disabled={!canSubmit || updateSpending.isPending}
          onPress={() =>
            updateSpending.mutate(
              {
                type: expType === "지출" ? "EXPENSE" : "INCOME",
                categoryId: expCategoryId ?? undefined,
                categoryGroupKey: expCategoryId === null ? expGroupKey ?? undefined : undefined,
                amount: parseInt(expAmount, 10),
                date: format(selectedDate, "yyyy-MM-dd"),
                memo: expMemo || null,
                imageUrl: imageUrl,
              },
              { onSuccess: () => router.back() }
            )
          }
          style={({ pressed }) => [styles.primaryBtn, (!canSubmit || updateSpending.isPending) && styles.btnDisabled, pressed && { opacity: 0.8 }]}
        >
          <Text style={styles.primaryBtnText}>{updateSpending.isPending ? "수정 중..." : "수정하기"}</Text>
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
  dateSub: { textAlign: "center", fontSize: 17, fontWeight: "600", color: "#191f28", paddingTop: 10, paddingBottom: 2 },
  timeSub: { textAlign: "center", fontSize: 12, color: "#adb5bd", paddingBottom: 10 },
  scroll: { flex: 1, paddingHorizontal: 20 },
  footer: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 20, borderTopWidth: 1, borderTopColor: "#f2f4f6", gap: 8 },
  errorText: { fontSize: 12, color: "#f04452", textAlign: "center" },
  primaryBtn: { height: 52, borderRadius: 16, backgroundColor: "#3182f6", alignItems: "center", justifyContent: "center" },
  primaryBtnText: { fontSize: 16, fontWeight: "700", color: "#fff" },
  btnDisabled: { opacity: 0.3 },
});
