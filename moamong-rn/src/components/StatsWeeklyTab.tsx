import { View, Text, Pressable, ActivityIndicator, StyleSheet } from "react-native";
import { ChevronDown, ChevronUp } from "lucide-react-native";
import { format, parseISO } from "date-fns";
import { ko } from "date-fns/locale";
import { CategoryIcon } from "@/src/components/CategoryIcon";
import { Spending, WeeklyStats } from "@/src/features/spending/types";
import { useGroupSettings } from "@/src/features/user/hooks/useGroupSettings";

interface Props {
  weeklyStats: WeeklyStats | undefined;
  spendings: Spending[];
  expandedWeek: number | null;
  onExpandWeek: (week: number | null) => void;
  isLoading: boolean;
  panHandlers: Record<string, any>;
}

export function StatsWeeklyTab({ weeklyStats, spendings, expandedWeek, onExpandWeek, isLoading, panHandlers }: Props) {
  const { getColor, getIcon } = useGroupSettings();
  const chartData = (weeklyStats?.weeks ?? []).map((w) => ({
    name: `${w.week}주차`,
    amount: w.amount,
    date: `${format(parseISO(w.startDate), "M.d")} ~ ${format(parseISO(w.endDate), "M.d")}`,
    startDate: w.startDate,
    endDate: w.endDate,
    week: w.week,
  }));
  const maxAmount = chartData.length ? Math.max(...chartData.map((d) => d.amount)) : 0;

  // 리스트용 데이터는 역순(최신 주차부터)으로 정렬
  const listData = [...chartData].reverse();

  const getWeekItems = (startDate: string, endDate: string) =>
    spendings
      .filter((s) => s.date >= startDate && s.date <= endDate && s.type === "EXPENSE")
      .sort((a, b) => b.date.localeCompare(a.date));

  return (
    <View style={styles.contentSection} {...panHandlers}>
      {/* Bar Chart */}
      <View style={styles.chartSection}>
        <View style={styles.chartHeader}>
          <Text style={styles.cardTitle}>주차별 지출 추이</Text>
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#3182f6" />
            <Text style={styles.loadingText}>데이터 분석 중...</Text>
          </View>
        ) : chartData.length === 0 ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>이번 달 지출 내역이 없어요</Text>
          </View>
        ) : (
          <View style={styles.chartArea} {...panHandlers}>
            <View style={styles.chartBars}>
              {chartData.map((w, idx) => {
                const barHeight = maxAmount > 0 ? (w.amount / maxAmount) * 140 : 0;
                const isMax = w.amount === maxAmount && maxAmount > 0;
                return (
                  <View key={idx} style={styles.chartBarCol}>
                    <View style={styles.barWrapper}>
                      <View style={styles.barTrack}>
                        <View style={[styles.barAmountContainer, { bottom: barHeight + 8 }]}>
                          <Text
                            style={[styles.barAmount, isMax ? { color: "#3182f6", fontWeight: "800" } : { color: "#4e5968" }]}
                            numberOfLines={1}
                          >
                            {w.amount >= 10000
                              ? `${(w.amount / 10000).toFixed(w.amount % 10000 === 0 ? 0 : 1)}만`
                              : w.amount.toLocaleString()}
                          </Text>
                        </View>
                        <View style={[styles.barFill, { height: barHeight, backgroundColor: isMax ? "#3182f6" : "#cbdcfb" }]} />
                      </View>
                    </View>
                    <Text style={[styles.barLabel, isMax && { color: "#191f28", fontWeight: "800" }]}>{w.week}주</Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}
      </View>

      {/* Weekly Accordion */}
      <View style={styles.accordionContainer}>
        <Text style={styles.sectionHeading}>지출 내역</Text>
        <View>
          {listData.length === 0 ? (
            <Text style={styles.emptyAccordionText}>기록된 지출이 없어요</Text>
          ) : (
            listData.map((week) => {
              const isOpen = expandedWeek === week.week;
              const items = getWeekItems(week.startDate, week.endDate);
              return (
                <View key={week.week} style={styles.tossGroup}>
                  <Pressable
                    onPress={() => onExpandWeek(isOpen ? null : week.week)}
                    style={({ pressed }) => [styles.tossHeader, isOpen && styles.tossHeaderOpen, pressed && { backgroundColor: "#f9fafb" }]}
                  >
                    <View style={styles.tossHeaderLeft}>
                      <Text style={styles.tossWeekName}>{week.name}</Text>
                      <Text style={styles.tossDateRange}>{week.date}</Text>
                    </View>
                    <View style={styles.tossHeaderRight}>
                      <View style={{ alignItems: "flex-end", marginRight: 8 }}>
                        <Text style={[styles.tossTotalAmount, week.amount === maxAmount && maxAmount > 0 && { color: "#3182f6" }]}>
                          {week.amount.toLocaleString()}원
                        </Text>
                      </View>
                      <View style={styles.chevronContainer}>
                        {isOpen ? <ChevronUp size={18} color="#b0b8c1" /> : <ChevronDown size={18} color="#b0b8c1" />}
                      </View>
                    </View>
                  </Pressable>

                  {isOpen && (
                    <View style={styles.tossList}>
                      {items.length === 0 ? (
                        <Text style={styles.emptyItemsText}>이 주에 지출 내역이 없어요</Text>
                      ) : (
                        items.map((item, idx) => (
                          <View key={item.id} style={[styles.tossRow, idx === items.length - 1 && { borderBottomWidth: 0 }]}>
                            {(() => {
                              const grpColor = getColor(item.categoryGroup as any);
                              const grpIcon = getIcon(item.categoryGroup as any);
                              return (
                                <View style={[styles.tossIconContainer, { backgroundColor: grpColor + "15" }]}>
                                  <CategoryIcon emoji={grpIcon} color={grpColor} size={22} />
                                </View>
                              );
                            })()}
                            <View style={styles.tossInfo}>
                              <Text style={styles.tossMemo} numberOfLines={1}>{item.memo || item.categoryName}</Text>
                              <Text style={styles.tossMeta}>{format(parseISO(item.date), "M월 d일", { locale: ko })}</Text>
                            </View>
                            <Text style={styles.tossAmount}>{item.amount.toLocaleString()}원</Text>
                          </View>
                        ))
                      )}
                    </View>
                  )}
                </View>
              );
            })
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  contentSection: { paddingHorizontal: 20, paddingTop: 16, gap: 32 },
  chartSection: { paddingHorizontal: 4 },
  chartHeader: { marginBottom: 32 },
  cardTitle: { fontSize: 18, fontWeight: "800", color: "#191f28" },
  chartArea: { height: 260, justifyContent: "flex-end" },
  chartBars: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-around" },
  chartBarCol: { alignItems: "center", flex: 1 },
  barWrapper: { height: 200, justifyContent: "flex-end", alignItems: "center", width: "100%" },
  barAmountContainer: { position: "absolute", left: -40, right: -40, alignItems: "center", zIndex: 2 },
  barAmount: { fontSize: 11, fontWeight: "700", textAlign: "center" },
  barTrack: { width: 32, height: 140, backgroundColor: "transparent", borderRadius: 8, justifyContent: "flex-end", overflow: "visible", position: "relative" },
  barFill: { width: "100%", borderRadius: 8 },
  barLabel: { fontSize: 13, fontWeight: "600", color: "#8b95a1", marginTop: 12 },
  loadingContainer: { height: 260, alignItems: "center", justifyContent: "center", gap: 12 },
  loadingText: { fontSize: 14, color: "#adb5bd", fontWeight: "600" },
  accordionContainer: { gap: 16 },
  sectionHeading: { fontSize: 13, fontWeight: "700", color: "#8b95a1", textTransform: "uppercase", letterSpacing: 1.5, paddingHorizontal: 4 },
  tossGroup: { backgroundColor: "#ffffff", borderRadius: 24, marginBottom: 16, overflow: "hidden", borderWidth: 1, borderColor: "rgba(0,0,0,0.03)" },
  tossHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingVertical: 18 },
  tossHeaderOpen: { borderBottomWidth: 1, borderBottomColor: "#f2f4f6" },
  tossHeaderLeft: { flex: 1, gap: 2, marginRight: 12 },
  tossWeekName: { fontSize: 16, fontWeight: "700", color: "#191f28" },
  tossDateRange: { fontSize: 12, fontWeight: "500", color: "#adb5bd" },
  tossHeaderRight: { flexDirection: "row", alignItems: "center", flexShrink: 0 },
  tossTotalAmount: { fontSize: 16, fontWeight: "800", color: "#4e5968" },
  chevronContainer: { width: 24, alignItems: "flex-end", justifyContent: "center" },
  tossList: { paddingVertical: 8 },
  tossRow: { flexDirection: "row", alignItems: "center", gap: 16, paddingHorizontal: 20, paddingVertical: 14 },
  tossIconContainer: { width: 44, height: 44, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  tossInfo: { flex: 1, gap: 2 },
  tossMemo: { fontSize: 15, fontWeight: "600", color: "#191f28" },
  tossMeta: { fontSize: 12, fontWeight: "500", color: "#adb5bd" },
  tossAmount: { fontSize: 15, fontWeight: "700", color: "#191f28" },
  emptyItemsText: { textAlign: "center", paddingVertical: 24, fontSize: 13, color: "#adb5bd", fontWeight: "500" },
  emptyAccordionText: { textAlign: "center", paddingVertical: 48, fontSize: 15, color: "#adb5bd", fontWeight: "500" },
});
