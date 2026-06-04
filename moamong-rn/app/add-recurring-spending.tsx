import { useState } from "react";
import {
  View, Text, Pressable, ScrollView, TextInput,
  KeyboardAvoidingView, StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { ExpenseFormFields } from "@/src/components/ExpenseFormFields";
import { useUserCategories } from "@/src/features/user/queries/useUserCategories";
import { useCreateRecurringSpending } from "@/src/features/spending/mutations/useCreateRecurringSpending";

// 숫자만 입력받아 YYYY-MM-DD로 자동 포맷
function formatDateInput(text: string): string {
  const digits = text.replace(/[^0-9]/g, "").slice(0, 8);
  if (digits.length <= 4) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 4)}-${digits.slice(4)}`;
  return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6)}`;
}

function isValidDate(s: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const d = new Date(s);
  return !isNaN(d.getTime()) && s === d.toISOString().slice(0, 10);
}

export default function AddRecurringSpendingScreen() {
  const [expType, setExpType] = useState<"지출" | "수입">("지출");
  const [expAmount, setExpAmount] = useState("");
  const [expMemo, setExpMemo] = useState("");
  const [expCategoryId, setExpCategoryId] = useState<number | null>(null);
  const [expGroupKey, setExpGroupKey] = useState<string | null>(null);
  const [dayOfMonth, setDayOfMonth] = useState("");
  const [dayError, setDayError] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const { userCategories } = useUserCategories();
  const createMutation = useCreateRecurringSpending();

  const handleDayChange = (t: string) => {
    const digits = t.replace(/[^0-9]/g, "");
    setDayOfMonth(digits);
    if (digits === "") {
      setDayError("");
      return;
    }
    const n = parseInt(digits, 10);
    setDayError(n < 1 || n > 28 ? "1~28일 사이로 입력해주세요" : "");
  };

  const dateRangeError =
    endDate !== "" && isValidDate(endDate) && isValidDate(startDate) && endDate < startDate
      ? "종료일은 시작일보다 이후여야 합니다"
      : "";

  const canSubmit =
    expAmount !== "" && parseInt(expAmount, 10) > 0 &&
    (expCategoryId !== null || expGroupKey !== null) &&
    dayOfMonth !== "" && dayError === "" &&
    isValidDate(startDate) &&
    (endDate === "" || isValidDate(endDate)) &&
    dateRangeError === "";

  const handleSave = () => {
    createMutation.mutate(
      {
        type: expType === "지출" ? "EXPENSE" : "INCOME",
        categoryId: expCategoryId ?? null,
        categoryGroupKey: expCategoryId === null ? expGroupKey ?? null : null,
        amount: parseInt(expAmount, 10),
        dayOfMonth: parseInt(dayOfMonth, 10),
        startDate,
        endDate: endDate || null,
        memo: expMemo || null,
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
        <Text style={styles.headerTitle}>정기 지출 추가</Text>
        <View style={{ width: 44 }} />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
        <ScrollView style={styles.scroll} keyboardShouldPersistTaps="handled">
          <ExpenseFormFields
            expType={expType}
            expAmount={expAmount}
            expMemo={expMemo}
            expCategoryId={expCategoryId}
            userCategories={userCategories}
            onChangeType={(type, firstCategoryId) => {
              setExpType(type);
              setExpCategoryId(firstCategoryId);
              setExpGroupKey(null);
            }}
            onChangeAmount={setExpAmount}
            onChangeMemo={setExpMemo}
            onChangeCategoryId={setExpCategoryId}
            onChangeGroupKey={(g) => setExpGroupKey(g)}
          />

          <Text style={styles.sectionLabel}>반복 설정</Text>

          <Text style={styles.fieldLabel}>매월 날짜 (1~28)</Text>
          <View style={[styles.inputRow, dayError ? styles.inputRowError : null]}>
            <TextInput
              style={styles.input}
              value={dayOfMonth}
              onChangeText={handleDayChange}
              keyboardType="numeric"
              placeholder="예: 25"
              placeholderTextColor="#c9cdd2"
              maxLength={2}
            />
            <Text style={styles.inputSuffix}>일</Text>
          </View>
          {dayError ? <Text style={styles.fieldError}>{dayError}</Text> : null}

          <Text style={styles.fieldLabel}>시작일</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              value={startDate}
              onChangeText={(t) => setStartDate(formatDateInput(t))}
              keyboardType="numeric"
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#c9cdd2"
              maxLength={10}
            />
          </View>

          <Text style={styles.fieldLabel}>종료일 <Text style={styles.optional}>(선택, 비워두면 무기한)</Text></Text>
          <View style={[styles.inputRow, dateRangeError ? styles.inputRowError : null]}>
            <TextInput
              style={styles.input}
              value={endDate}
              onChangeText={(t) => setEndDate(formatDateInput(t))}
              keyboardType="numeric"
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#c9cdd2"
              maxLength={10}
            />
          </View>
          {dateRangeError ? <Text style={styles.fieldError}>{dateRangeError}</Text> : null}
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={styles.footer}>
        {createMutation.error && (
          <Text style={styles.errorText}>{(createMutation.error as Error).message || "오류가 발생했습니다."}</Text>
        )}
        <Pressable
          disabled={!canSubmit || createMutation.isPending}
          onPress={handleSave}
          style={({ pressed }) => [styles.primaryBtn, (!canSubmit || createMutation.isPending) && styles.btnDisabled, pressed && { opacity: 0.8 }]}
        >
          <Text style={styles.primaryBtnText}>{createMutation.isPending ? "저장 중..." : "저장하기"}</Text>
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
  scroll: { flex: 1, paddingHorizontal: 20 },

  sectionLabel: { fontSize: 12, fontWeight: "700", color: "#adb5bd", textTransform: "uppercase", letterSpacing: 1, marginBottom: 16 },

  fieldLabel: { fontSize: 12, fontWeight: "700", color: "#adb5bd", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8, marginTop: 16 },
  optional: { fontSize: 11, color: "#c9cdd2", textTransform: "none", letterSpacing: 0, fontWeight: "400" },
  inputRow: { flexDirection: "row", alignItems: "center", borderBottomWidth: 1, borderBottomColor: "#e5e8eb", paddingBottom: 16 },
  inputRowError: { borderBottomColor: "#f04452" },
  input: { flex: 1, fontSize: 20, fontWeight: "600", color: "#191f28" },
  inputSuffix: { fontSize: 20, fontWeight: "600", color: "#8b95a1", marginLeft: 4 },
  fieldError: { fontSize: 12, color: "#f04452", marginTop: 4 },

  footer: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 20, borderTopWidth: 1, borderTopColor: "#f2f4f6", gap: 8 },
  errorText: { fontSize: 12, color: "#f04452", textAlign: "center" },
  primaryBtn: { height: 52, borderRadius: 16, backgroundColor: "#3182f6", alignItems: "center", justifyContent: "center" },
  primaryBtnText: { fontSize: 16, fontWeight: "700", color: "#fff" },
  btnDisabled: { opacity: 0.3 },
});
