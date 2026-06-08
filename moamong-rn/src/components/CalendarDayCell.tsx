import { View, Text, Pressable, StyleSheet } from "react-native";
import { format, isSameDay, isSameMonth } from "date-fns";
import { Spending, RecurringSpending } from "@/src/features/spending/types";

interface Props {
  day: Date;
  today: Date;
  selectedDate: Date;
  currentDate: Date;
  spendings: Spending[];
  recurrings?: RecurringSpending[];
  onSelectDate: (date: Date) => void;
}

function fmtAmt(amt: number) {
  if (amt >= 10000) {
    const val = amt / 10000;
    return `${val.toFixed(val % 1 === 0 ? 0 : 1)}만`;
  }
  return amt.toLocaleString();
}

export function CalendarDayCell({ day, today, selectedDate, currentDate, spendings, recurrings = [], onSelectDate }: Props) {
  const dayExp = spendings.filter((e) => isSameDay(new Date(e.date), day));
  const dayRecurring = recurrings.filter((r) => r.dayOfMonth === day.getDate());

  const expAmt = dayExp.filter((e) => e.type === "EXPENSE").reduce((s, e) => s + e.amount, 0)
    + dayRecurring.filter((r) => r.type === "EXPENSE").reduce((s, r) => s + r.amount, 0);
  const incAmt = dayExp.filter((e) => e.type === "INCOME").reduce((s, e) => s + e.amount, 0)
    + dayRecurring.filter((r) => r.type === "INCOME").reduce((s, r) => s + r.amount, 0);

  const isToday = isSameDay(day, today);
  const isSelected = isSameDay(day, selectedDate);
  const isCurrentMonth = isSameMonth(day, currentDate);
  const dow = day.getDay();

  return (
    <Pressable
      onPress={() => isCurrentMonth && onSelectDate(day)}
      style={({ pressed }) => [
        styles.calCell,
        !isCurrentMonth && styles.calCellOtherMonth,
        isSelected && isCurrentMonth && styles.calCellSelected,
        pressed && isCurrentMonth && { opacity: 0.7 },
      ]}
    >
      <View style={[styles.calDayCircle, isToday && styles.calDayCircleToday]}>
        <Text
          style={[
            styles.calDayNum,
            isToday && styles.calDayNumToday,
            !isToday && dow === 0 && { color: "#f04452" },
            !isToday && dow === 6 && { color: "#3182f6" },
            !isCurrentMonth && { color: "#f2f4f6" },
          ]}
        >
          {format(day, "d")}
        </Text>

      </View>
      {isCurrentMonth && (incAmt > 0 || expAmt > 0) && (
        <View style={styles.calAmtCol}>
          {incAmt > 0 && <Text style={styles.calIncomeAmt}>+{fmtAmt(incAmt)}</Text>}
          {expAmt > 0 && <Text style={styles.calExpAmt}>-{fmtAmt(expAmt)}</Text>}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  calCell: {
    width: "14.285714%",
    height: 68,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: 4,
    borderRadius: 16,
  },
  calCellOtherMonth: {},
  calCellSelected: {
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 25,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
  },
  calDayCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  calDayCircleToday: { backgroundColor: "#3182f6" },
  calDayNum: { fontSize: 13, fontWeight: "700", color: "#4e5968" },
  calDayNumToday: { color: "#fff" },
  calAmtCol: { alignItems: "center", marginTop: 2 },
  calIncomeAmt: { fontSize: 10, fontWeight: "800", color: "#3182f6" },
  calExpAmt: { fontSize: 10, fontWeight: "800", color: "#f04452" },
});
