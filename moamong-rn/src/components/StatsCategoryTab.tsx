import { useState } from "react";
import { View, Text, ActivityIndicator, Dimensions, StyleSheet, Pressable } from "react-native";
import { ChevronDown, ChevronUp } from "lucide-react-native";
import Svg, { Circle } from "react-native-svg";
import { format, parseISO } from "date-fns";
import { ko } from "date-fns/locale";
import { DonutChart } from "@/src/components/DonutChart";
import { CategoryIcon } from "@/src/components/CategoryIcon";
import { CategoryStats, Spending } from "@/src/features/spending/types";
import { CategoryGroup } from "@/src/features/user/types";
import { useGroupSettings } from "@/src/features/user/hooks/useGroupSettings";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface Props {
  categoryStats: CategoryStats | undefined;
  spendings: Spending[];
  isLoading: boolean;
  panHandlers: Record<string, any>;
}

export function StatsCategoryTab({ categoryStats, spendings, isLoading, panHandlers }: Props) {
  const { getColor, getIcon, getLabel } = useGroupSettings();
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  if (isLoading) {

    return (
      <View style={styles.contentSection}>
        <View style={styles.fullLoadingContainer}>
          <ActivityIndicator size="large" color="#3182f6" />
          <Text style={styles.loadingText}>카테고리 분석 중...</Text>
        </View>
      </View>
    );
  }

  if (!categoryStats || categoryStats.categories.length === 0) {
    return (
      <View style={[styles.contentSection, { alignItems: "center" }]} {...panHandlers}>
        <View style={{ width: SCREEN_WIDTH, height: SCREEN_WIDTH }}>
          <Svg width={SCREEN_WIDTH} height={SCREEN_WIDTH}>
            <Circle
              cx={SCREEN_WIDTH / 2}
              cy={SCREEN_WIDTH / 2}
              r={SCREEN_WIDTH * 0.2}
              stroke="#f2f4f6"
              strokeWidth={SCREEN_WIDTH * 0.082}
              fill="transparent"
            />
          </Svg>
          <View style={styles.donutCenterLabel}>
            <Text style={styles.donutCenterTitle}>이번 달</Text>
            <Text style={[styles.donutCenterValue, { color: "#d1d6db" }]}>0원</Text>
          </View>
        </View>
        <Text style={styles.emptyStatsText}>지출 내역이 없어요</Text>
      </View>
    );
  }

  const sorted = [...categoryStats.categories].sort((a, b) => b.percentage - a.percentage);

  return (
    <View style={styles.contentSection} {...panHandlers}>
      <View style={styles.chartFlat}>
        <DonutChart data={sorted} total={categoryStats.totalAmount} />
      </View>

      <View style={styles.accordionContainer}>
        <Text style={styles.sectionHeading}>카테고리별 내역</Text>
        <View>
          {sorted.map((item, idx) => {
            const color = getColor(item.categoryGroup as CategoryGroup);
            const icon = getIcon(item.categoryGroup as CategoryGroup);
            const isOpen = expandedCategory === item.categoryGroup;
            const items = spendings
              .filter((s) => s.categoryGroup === item.categoryGroup && s.type === "EXPENSE")
              .sort((a, b) => b.date.localeCompare(a.date));

            return (
              <View key={`${item.categoryGroup}-${idx}`} style={styles.tossGroup}>
                <Pressable
                  onPress={() => setExpandedCategory(isOpen ? null : item.categoryGroup)}
                  style={({ pressed }) => [styles.catRow, isOpen && styles.borderBottom, pressed && { backgroundColor: "#f9fafb" }]}
                >
                  <View style={[styles.tossIconContainer, { backgroundColor: color + "20" }]}>
                    <CategoryIcon emoji={icon} color={color} size={22} />
                  </View>
                  <View style={styles.catInfo}>
                    <View style={styles.catMainInfo}>
                      <Text style={styles.catName}>{getLabel(item.categoryGroup as CategoryGroup)}</Text>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                        <Text style={styles.catAmount}>{item.amount.toLocaleString()}원</Text>
                        {isOpen ? (
                          <ChevronUp size={16} color="#b0b8c1" />
                        ) : (
                          <ChevronDown size={16} color="#b0b8c1" />
                        )}
                      </View>
                    </View>
                    <View style={styles.catSubInfo}>
                      <View style={styles.catProgressBarBg}>
                        <View style={[styles.catProgressBarFill, { width: `${item.percentage}%`, backgroundColor: color }]} />
                      </View>
                      <Text style={styles.catPercent}>{Math.round(item.percentage)}%</Text>
                    </View>
                  </View>
                </Pressable>

                {isOpen && (
                  <View style={styles.tossList}>
                    {items.length === 0 ? (
                      <Text style={styles.emptyItemsText}>내역이 없어요</Text>
                    ) : (
                      items.map((spending, sIdx) => (
                        <View key={spending.id} style={[styles.tossListRow, sIdx === items.length - 1 && { borderBottomWidth: 0 }]}>
                          <View style={styles.tossListInfo}>
                            <Text style={styles.tossListMemo} numberOfLines={1}>
                              {spending.memo || spending.categoryName}
                            </Text>
                            <Text style={styles.tossListMeta}>
                              {format(parseISO(spending.date), "M월 d일", { locale: ko })}
                            </Text>
                          </View>
                          <Text style={styles.tossListAmount}>{spending.amount.toLocaleString()}원</Text>
                        </View>
                      ))
                    )}
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  contentSection: { paddingHorizontal: 20, paddingTop: 32, gap: 32 },
  fullLoadingContainer: { height: 400, alignItems: "center", justifyContent: "center", gap: 12 },
  loadingText: { fontSize: 14, color: "#adb5bd", fontWeight: "600", marginTop: 16 },
  chartFlat: { alignItems: "center", paddingVertical: 8 },
  donutCenterLabel: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, alignItems: "center", justifyContent: "center" },
  donutCenterTitle: { fontSize: 13, fontWeight: "600", color: "#8b95a1" },
  donutCenterValue: { fontSize: 22, fontWeight: "900", color: "#191f28", marginTop: 2 },
  emptyStatsText: { fontSize: 15, color: "#adb5bd", fontWeight: "500" },
  accordionContainer: { gap: 16 },
  sectionHeading: { fontSize: 13, fontWeight: "700", color: "#8b95a1", textTransform: "uppercase", letterSpacing: 1.5, paddingHorizontal: 4 },
  tossGroup: { backgroundColor: "#ffffff", borderRadius: 24, marginBottom: 20, overflow: "hidden", borderWidth: 1, borderColor: "rgba(0,0,0,0.03)" },
  tossIconContainer: { width: 44, height: 44, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  catRow: { flexDirection: "row", alignItems: "center", gap: 16, paddingHorizontal: 20, paddingVertical: 20 },
  borderBottom: { borderBottomWidth: 1, borderBottomColor: "#f2f4f6" },
  catInfo: { flex: 1, gap: 8 },
  catMainInfo: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  catName: { fontSize: 16, fontWeight: "700", color: "#191f28" },
  catAmount: { fontSize: 16, fontWeight: "800", color: "#191f28" },
  catSubInfo: { flexDirection: "row", alignItems: "center", gap: 12 },
  catProgressBarBg: { flex: 1, height: 6, backgroundColor: "#f2f4f6", borderRadius: 3, overflow: "hidden" },
  catProgressBarFill: { height: "100%", borderRadius: 3 },
  catPercent: { fontSize: 12, fontWeight: "700", color: "#8b95a1", width: 32, textAlign: "right" },
  tossList: { paddingVertical: 8 },
  tossListRow: { flexDirection: "row", alignItems: "center", gap: 16, paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: "#f2f4f6" },
  tossListInfo: { flex: 1, gap: 2 },
  tossListMemo: { fontSize: 15, fontWeight: "600", color: "#191f28" },
  tossListMeta: { fontSize: 12, fontWeight: "500", color: "#adb5bd" },
  tossListAmount: { fontSize: 15, fontWeight: "700", color: "#191f28" },
  emptyItemsText: { textAlign: "center", paddingVertical: 24, fontSize: 13, color: "#adb5bd", fontWeight: "500" },
});
