import { useState, useCallback } from "react";
import { View, Text, ScrollView, Pressable, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useWeeklyStats } from "@/src/features/spending/queries/useWeeklyStats";
import { useCategoryStats } from "@/src/features/spending/queries/useCategoryStats";
import { useSpendings } from "@/src/features/spending/queries/useSpendings";
import { useMonthSwipe } from "@/src/features/spending/hooks/useMonthSwipe";
import { useLocalSearchParams, router, useFocusEffect } from "expo-router";
import { format } from "date-fns";
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown } from "lucide-react-native";
import { StatsWeeklyTab } from "@/src/components/StatsWeeklyTab";
import { StatsCategoryTab } from "@/src/components/StatsCategoryTab";
import { ErrorView } from "@/src/components/ErrorView";
import { WeeklyStats, CategoryStats } from "@/src/features/spending/types";

export default function StatsScreen() {
  const [tab, setTab] = useState<"weekly" | "category">("category");
  const [expandedWeek, setExpandedWeek] = useState<number | null>(null);

  const params = useLocalSearchParams<{ year?: string; month?: string }>();
  const initialDate = params.year && params.month
    ? new Date(Number(params.year), Number(params.month) - 1)
    : undefined;

  const { currentDate, setCurrentDate, year, month, panHandlers } = useMonthSwipe(initialDate);

  useFocusEffect(
    useCallback(() => {
      if (params.year && params.month) {
        setCurrentDate(new Date(Number(params.year), Number(params.month) - 1));
      }
    }, [params.year, params.month])
  );

  const { data: weeklyStats, isLoading: weeklyLoading, isError: weeklyError, refetch: refetchWeekly } = useWeeklyStats<WeeklyStats>(year, month);
  const { data: categoryStats, isLoading: categoryLoading, isError: categoryError, refetch: refetchCategory } = useCategoryStats<CategoryStats>(year, month);
  const { spendings } = useSpendings(year, month);

  const totalAmount = categoryStats?.totalAmount ?? weeklyStats?.totalAmount ?? 0;
  const lastMonthTotal = categoryStats?.lastMonthTotalAmount ?? 0;
  const diff = totalAmount - lastMonthTotal;

  const isLoading = tab === "weekly" ? weeklyLoading : categoryLoading;
  const isError = tab === "weekly" ? weeklyError : categoryError;

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.headerNav}>
          <View style={styles.monthRow}>
            {params.year ? (
              <Pressable
                onPress={() => router.back()}
                style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.5 }]}
              >
                <ChevronLeft size={24} color="#191f28" />
              </Pressable>
            ) : (
              <View style={styles.backBtn} />
            )}
            <View style={styles.monthSelector}>
              <Pressable
                onPress={() => setCurrentDate(new Date(year, month - 2))}
                style={({ pressed }) => [styles.chevronBtn, pressed && { opacity: 0.5 }]}
              >
                <ChevronLeft size={24} color="#b0b8c1" />
              </Pressable>
              <Text style={styles.monthTitle}>{format(currentDate, "yyyy년 M월")}</Text>
              <Pressable
                onPress={() => setCurrentDate(new Date(year, month))}
                style={({ pressed }) => [styles.chevronBtn, pressed && { opacity: 0.5 }]}
              >
                <ChevronRight size={24} color="#b0b8c1" />
              </Pressable>
            </View>
            <View style={styles.backBtn} />
          </View>

          <View style={styles.totalHero}>
            <View style={styles.totalAmountRow}>
              <Text style={styles.totalAmountText}>{totalAmount.toLocaleString()}</Text>
              <Text style={styles.totalAmountUnit}>원</Text>
            </View>
            {!isLoading && lastMonthTotal > 0 && (
              <View style={[
                styles.diffBadge,
                { backgroundColor: diff >= 0 ? "#fff0f1" : "#e8f3ff", borderColor: diff >= 0 ? "rgba(240, 68, 82, 0.1)" : "rgba(49, 130, 246, 0.1)" }
              ]}>
                {diff >= 0 ? <TrendingUp size={14} color="#f04452" /> : <TrendingDown size={14} color="#3182f6" />}
                <Text style={[styles.diffText, { color: diff >= 0 ? "#f04452" : "#3182f6" }]}>
                  지난달보다 {Math.abs(diff).toLocaleString()}원 {diff >= 0 ? "더" : "덜"} 썼어요
                </Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.tabBar}>
          {(["category", "weekly"] as const).map((t) => (
            <Pressable
              key={t}
              onPress={() => setTab(t)}
              style={[styles.tabItem, tab === t && styles.tabItemActive]}
            >
              <Text style={[styles.tabText, tab === t ? styles.tabTextActive : styles.tabTextInactive]}>
                {t === "weekly" ? "주차별" : "카테고리별"}
              </Text>
            </Pressable>
          ))}
        </View>

        {isError ? (
          <ErrorView onRetry={() => tab === "weekly" ? refetchWeekly() : refetchCategory()} />
        ) : tab === "weekly" ? (
          <StatsWeeklyTab
            weeklyStats={weeklyStats}
            spendings={spendings}
            expandedWeek={expandedWeek}
            onExpandWeek={setExpandedWeek}
            isLoading={weeklyLoading}
            panHandlers={panHandlers}
          />
        ) : (
          <StatsCategoryTab
            categoryStats={categoryStats}
            spendings={spendings}
            isLoading={categoryLoading}
            panHandlers={panHandlers}
          />
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#ffffff" },
  scroll: { flex: 1 },
  headerNav: { alignItems: "center", paddingTop: 6, marginBottom: 40, paddingHorizontal: 12 },
  monthRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", width: "100%", marginBottom: 8 },
  backBtn: { width: 40, alignItems: "flex-start" },
  monthSelector: { flexDirection: "row", alignItems: "center", gap: 8 },
  chevronBtn: { padding: 8 },
  monthTitle: { fontSize: 20, fontWeight: "700", color: "#4e5968" },
  totalHero: { alignItems: "center" },
  totalAmountRow: { flexDirection: "row", alignItems: "baseline", gap: 2 },
  totalAmountText: { fontSize: 36, fontWeight: "900", color: "#191f28", letterSpacing: -1 },
  totalAmountUnit: { fontSize: 20, fontWeight: "700", color: "#191f28" },
  diffBadge: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, marginTop: 6 },
  diffText: { fontSize: 13, fontWeight: "700" },
  tabBar: { flexDirection: "row", gap: 32, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: "rgba(0,0,0,0.05)" },
  tabItem: { paddingBottom: 16, borderBottomWidth: 3, borderBottomColor: "transparent" },
  tabItemActive: { borderBottomColor: "#3182f6" },
  tabText: { fontSize: 17, fontWeight: "700" },
  tabTextActive: { color: "#191f28" },
  tabTextInactive: { color: "#adb5bd" },
});
