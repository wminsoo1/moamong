import { useState, useMemo } from "react";
import { PanResponder } from "react-native";
import { addMonths, subMonths } from "date-fns";

export function useMonthSwipe(initialDate?: Date) {
  const [currentDate, setCurrentDate] = useState(initialDate ?? new Date());

  const panResponder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => false,
    onStartShouldSetPanResponderCapture: () => false,
    onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 5,
    onMoveShouldSetPanResponderCapture: (_, g) => Math.abs(g.dx) > 5,
    onPanResponderRelease: (_, g) => {
      if (g.dx < -20) setCurrentDate(d => addMonths(d, 1));
      else if (g.dx > 20) setCurrentDate(d => subMonths(d, 1));
    },
  }), []);

  return {
    currentDate,
    setCurrentDate,
    year: currentDate.getFullYear(),
    month: currentDate.getMonth() + 1,
    panHandlers: panResponder.panHandlers,
  };
}
