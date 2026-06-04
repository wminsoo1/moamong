import { useState, useCallback } from "react";
import { View, ScrollView, Pressable, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useFocusEffect } from "expo-router";
import { addMonths, subMonths, isSameDay, format } from "date-fns";
import { Plus } from "lucide-react-native";
import { useQueryClient } from "@tanstack/react-query";

import { useSpendings } from "@/src/features/spending/queries/useSpendings";
import { useActiveRecurringSpendings } from "@/src/features/spending/queries/useActiveRecurringSpendings";
import { spendingKeys } from "@/src/features/spending/keys";
import { MonthSummary } from "@/src/components/MonthSummary";
import { MonthCalendar } from "@/src/components/MonthCalendar";
import { DailyExpenseList } from "@/src/components/DailyExpenseList";

export default function HomeScreen() {
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(today);
  const [selectedDate, setSelectedDate] = useState(today);
  const queryClient = useQueryClient();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;

  useFocusEffect(
    useCallback(() => {
      queryClient.invalidateQueries({ queryKey: spendingKeys.byMonth(year, month) });
    }, [year, month])
  );

  const { spendings } = useSpendings(year, month);
  const { activeRecurrings } = useActiveRecurringSpendings(year, month);

  const selectedDateSpendings = spendings.filter((e) =>
    isSameDay(new Date(e.date), selectedDate)
  );

  const selectedDateRecurrings = activeRecurrings.filter(
    (r) => r.dayOfMonth === selectedDate.getDate()
  );

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <MonthSummary
          currentDate={currentDate}
          spendings={spendings}
          onPrevMonth={() => setCurrentDate((d) => subMonths(d, 1))}
          onNextMonth={() => setCurrentDate((d) => addMonths(d, 1))}
          onPressStats={() => router.push({ pathname: "/stats", params: { year: String(year), month: String(month) } })}
        />

        <View style={{ marginBottom: -16 }}>
          <MonthCalendar
            today={today}
            currentDate={currentDate}
            selectedDate={selectedDate}
            spendings={spendings}
            recurrings={activeRecurrings}
            onSelectDate={setSelectedDate}
            onSwipeLeft={() => setCurrentDate((d) => addMonths(d, 1))}
            onSwipeRight={() => setCurrentDate((d) => subMonths(d, 1))}
          />
        </View>

        <View style={styles.divider} />

        <DailyExpenseList
          selectedDate={selectedDate}
          spendings={selectedDateSpendings}
          recurrings={selectedDateRecurrings}
          onPressExpense={(expense) =>
            router.push({
              pathname: "/edit-expense/[id]",
              params: { id: String(expense.id), date: expense.date },
            })
          }
          onPressRecurring={(recurring) =>
            router.push({
              pathname: "/edit-recurring-spending/[id]",
              params: { id: String(recurring.id) },
            })
          }
        />

        <View style={{ height: 120 }} />
      </ScrollView>

      <Pressable
        onPress={() =>
          router.push({
            pathname: "/add-expense",
            params: { date: format(selectedDate, "yyyy-MM-dd") },
          })
        }
        style={({ pressed }) => [styles.fab, pressed && { opacity: 0.8 }]}
      >
        <Plus size={20} color="#fff" strokeWidth={2.5} />
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#ffffff" },
  scroll: { flex: 1, paddingHorizontal: 16 },
  divider: { height: 1, backgroundColor: "#f2f4f6", marginTop: 24, marginBottom: 12 },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#3182f6",
    alignItems: "center",
    justifyContent: "center",
  },
});
