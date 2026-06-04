import { View, Text, Pressable, StyleSheet } from "react-native";
import { format } from "date-fns";
import { ChevronLeft, ChevronRight, BarChart3 } from "lucide-react-native";
import { Spending } from "@/src/features/spending/types";

interface Props {
  currentDate: Date;
  spendings: Spending[];
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onPressStats?: () => void;
}

export function MonthSummary({ currentDate, spendings, onPrevMonth, onNextMonth, onPressStats }: Props) {
  const expenses = spendings.filter((e) => e.type === "EXPENSE");
  const monthlyExpense = expenses.reduce((sum, e) => sum + e.amount, 0);
  const expenseCount = expenses.length;
  const activeDays = new Set(expenses.map((e) => e.date)).size;
  const dailyAvg = Math.round(monthlyExpense / (activeDays || 1));

  return (
    <>
      <View style={styles.monthHeader}>
        <Pressable
          onPress={onPressStats}
          style={({ pressed }) => [styles.statsBtn, pressed && { opacity: 0.5 }]}
        >
          <BarChart3 size={22} color="#adb5bd" strokeWidth={2} />
        </Pressable>
        <View style={styles.monthNav}>
          <Pressable
            onPress={onPrevMonth}
            style={({ pressed }) => [styles.chevronBtn, pressed && { opacity: 0.5 }]}
          >
            <ChevronLeft size={20} color="#b0b8c1" />
          </Pressable>
          <Text style={styles.monthTitle}>{format(currentDate, "M월")}</Text>
          <Pressable
            onPress={onNextMonth}
            style={({ pressed }) => [styles.chevronBtn, pressed && { opacity: 0.5 }]}
          >
            <ChevronRight size={20} color="#b0b8c1" />
          </Pressable>
        </View>
        <View style={styles.statsBtnSpacer} />
      </View>

      <View style={styles.totalArea}>
        <View style={styles.totalAmountRow}>
          <Text style={styles.totalAmount}>{monthlyExpense.toLocaleString()}</Text>
          <Text style={styles.totalAmountUnit}>원</Text>
        </View>
        <View style={styles.totalSubRow}>
          <Text style={styles.totalSub}>지출 {expenseCount}건</Text>
          <View style={styles.dot} />
          <Text style={styles.totalSub}>일평균 {dailyAvg.toLocaleString()}원</Text>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  monthHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 4,
    marginBottom: 4,
    paddingHorizontal: 4,
  },
  statsBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  statsBtnSpacer: { width: 36 },
  monthNav: { flexDirection: "row", alignItems: "center", gap: 20 },
  chevronBtn: { padding: 4 },
  monthTitle: { fontSize: 17, fontWeight: "700", color: "#4e5968" },
  totalArea: { alignItems: "center", marginBottom: 20 },
  totalAmountRow: { flexDirection: "row", alignItems: "baseline", gap: 1 },
  totalAmount: { fontSize: 32, fontWeight: "900", color: "#191f28", letterSpacing: -0.8 },
  totalAmountUnit: { fontSize: 20, fontWeight: "700", color: "#191f28" },
  totalSubRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 4 },
  totalSub: { fontSize: 13, fontWeight: "600", color: "#8b95a1"},
  dot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: "#d1d6db" },
});
