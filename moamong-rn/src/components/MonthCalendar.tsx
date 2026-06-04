import { View, Text, StyleSheet, PanResponder } from "react-native";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  startOfWeek,
  endOfWeek,
} from "date-fns";
import { Spending, RecurringSpending } from "@/src/features/spending/types";
import { CalendarDayCell } from "./CalendarDayCell";

interface Props {
  today: Date;
  currentDate: Date;
  selectedDate: Date;
  spendings: Spending[];
  recurrings?: RecurringSpending[];
  onSelectDate: (date: Date) => void;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
}

const DAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"];

export function MonthCalendar({
  today,
  currentDate,
  selectedDate,
  spendings,
  recurrings = [],
  onSelectDate,
  onSwipeLeft,
  onSwipeRight,
}: Props) {
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => false,
    onStartShouldSetPanResponderCapture: () => false,
    onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 5,
    onMoveShouldSetPanResponderCapture: (_, g) => Math.abs(g.dx) > 5,
    onPanResponderRelease: (_, g) => {
      if (g.dx < -20) onSwipeLeft();
      else if (g.dx > 20) onSwipeRight();
    },
  });

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 0 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  return (
    <View {...panResponder.panHandlers}>
      <View style={styles.dayLabels}>
        {DAY_LABELS.map((d, i) => (
          <Text
            key={d}
            style={[
              styles.dayLabel,
              i === 0 && { color: "#f87171" },
              i === 6 && { color: "#60a5fa" },
            ]}
          >
            {d}
          </Text>
        ))}
      </View>

      <View style={styles.calendarGrid}>
        {calendarDays.map((day) => (
          <CalendarDayCell
            key={format(day, "yyyy-MM-dd")}
            day={day}
            today={today}
            selectedDate={selectedDate}
            currentDate={currentDate}
            spendings={spendings}
            recurrings={recurrings}
            onSelectDate={onSelectDate}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  dayLabels: { flexDirection: "row", marginBottom: 4 },
  dayLabel: {
    flex: 1,
    textAlign: "center",
    fontSize: 12,
    fontWeight: "700",
    color: "#c9cdd2",
  },
  calendarGrid: { flexDirection: "row", flexWrap: "wrap" },
});
