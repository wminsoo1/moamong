import { View, Text, Pressable, StyleSheet } from "react-native";
import { format } from "date-fns";
import { CategoryIcon } from "@/src/components/CategoryIcon";
import { Spending, RecurringSpending } from "@/src/features/spending/types";
import { CategoryGroup } from "@/src/features/user/types";
import { useGroupSettings } from "@/src/features/user/hooks/useGroupSettings";

interface Props {
  selectedDate: Date;
  spendings: Spending[];
  recurrings?: RecurringSpending[];
  onPressExpense: (expense: Spending) => void;
  onPressRecurring?: (recurring: RecurringSpending) => void;
}

export function DailyExpenseList({ selectedDate, spendings, recurrings = [], onPressExpense, onPressRecurring }: Props) {
  const { getColor, getIcon } = useGroupSettings();
  const isEmpty = spendings.length === 0 && recurrings.length === 0;

  return (
    <View style={{ paddingHorizontal: 4 }}>
      <Text style={styles.selectedDateTitle}>{format(selectedDate, "M월 d일")}</Text>

      {isEmpty ? (
        <Text style={styles.emptyText}>이날은 지출이 없어요</Text>
      ) : (
        <>
          {spendings.map((expense) => (
            <Pressable
              key={String(expense.id)}
              onPress={() => onPressExpense(expense)}
              style={({ pressed }) => [styles.expenseRow, pressed && { backgroundColor: "#f9fafb" }]}
            >
              {(() => {
                const g = expense.categoryGroup as CategoryGroup;
                return (
                  <View style={[styles.expenseIcon, { backgroundColor: getColor(g) }]}>
                    <CategoryIcon emoji={getIcon(g)} color={getColor(g)} isWhite size={20} />
                  </View>
                );
              })()}
              {(() => {
                const hasMemo = !!expense.memo;
                const hasSubCat = expense.categoryName !== expense.categoryGroupLabel;
                const subLine = (!hasMemo && !hasSubCat)
                  ? null
                  : (hasMemo && hasSubCat)
                    ? expense.categoryName
                    : expense.categoryGroupLabel;
                return (
                  <View style={styles.expenseInfo}>
                    <Text style={styles.expenseName} numberOfLines={1}>
                      {expense.memo || expense.categoryName}
                    </Text>
                    {(subLine || expense.shared) && (
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 2 }}>
                        {subLine && <Text style={styles.expenseCat} numberOfLines={1}>{subLine}</Text>}
                        {expense.shared && <Text style={styles.expenseShared}>공유됨</Text>}
                      </View>
                    )}
                  </View>
                );
              })()}
              <Text style={[styles.expenseAmt, expense.type === "INCOME" ? styles.amtIncome : styles.amtExpense]}>
                {expense.type === "INCOME" ? "+" : "-"}{expense.amount.toLocaleString()}원
              </Text>
            </Pressable>
          ))}

          {recurrings.map((r) => (
            <Pressable
              key={`recurring-${r.id}`}
              onPress={() => onPressRecurring?.(r)}
              style={({ pressed }) => [styles.expenseRow, pressed && { backgroundColor: "#f5f3ff" }]}
            >
              {(() => {
                const g = r.categoryGroup as CategoryGroup;
                return (
                  <View style={[styles.expenseIcon, { backgroundColor: getColor(g) + "99" }]}>
                    <CategoryIcon emoji={getIcon(g)} color={getColor(g)} isWhite size={20} />
                  </View>
                );
              })()}
              <View style={styles.expenseInfo}>
                <Text style={styles.expenseName} numberOfLines={1}>
                  {r.memo ?? r.categoryName}
                </Text>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 2 }}>
                  <Text style={styles.expenseCat} numberOfLines={1}>{r.categoryGroupLabel}</Text>
                  <Text style={styles.recurringBadge}>정기</Text>
                </View>
              </View>
              <Text style={[styles.expenseAmt, r.type === "INCOME" ? styles.amtIncome : styles.amtExpense]}>
                {r.type === "INCOME" ? "+" : "-"}{r.amount.toLocaleString()}원
              </Text>
            </Pressable>
          ))}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  selectedDateTitle: { fontSize: 24, fontWeight: "900", color: "#191f28", marginBottom: 4 },
  emptyText: {
    textAlign: "center",
    color: "#adb5bd",
    fontSize: 14,
    fontWeight: "600",
    paddingVertical: 40,
  },
  expenseRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
    borderRadius: 16,
    marginBottom: 4,
  },
  expenseIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  expenseInfo: { flex: 1 },
  expenseName: { fontSize: 15, fontWeight: "700", color: "#191f28" },
  expenseCat: { fontSize: 12, fontWeight: "600", color: "#8b95a1" },
  expenseShared: { fontSize: 12, fontWeight: "600", color: "#3182f6" },
  recurringBadge: { fontSize: 12, fontWeight: "600", color: "#8b5cf6" },
  expenseAmt: { fontSize: 15, fontWeight: "800" },
  amtIncome: { color: "#3182f6" },
  amtExpense: { color: "#f04452" },
});
