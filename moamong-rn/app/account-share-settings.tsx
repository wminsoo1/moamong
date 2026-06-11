import { View, Text, Pressable, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { useCategoryGroups } from "@/src/features/user/queries/useCategoryGroups";
import { useAccountShareSettings } from "@/src/features/user/queries/useAccountShareSettings";
import { useUpdateAccountShareSettings } from "@/src/features/user/mutations/useUpdateAccountShareSettings";
import { CategoryIcon } from "@/src/components/CategoryIcon";
import { useGroupSettings } from "@/src/features/user/hooks/useGroupSettings";

const INCOME_GROUPS = new Set(["EMPLOYMENT", "INVESTMENT", "PENSION", "ETC"]);

export default function AccountShareSettingsScreen() {
  const { data: allGroups = [] } = useCategoryGroups();
  const categoryGroups = allGroups.filter((g) => !INCOME_GROUPS.has(g.groupKey));
  const { data: settings } = useAccountShareSettings();
  const updateSettings = useUpdateAccountShareSettings();
  const { getIcon } = useGroupSettings();

  const hidden = settings?.hiddenCategories ?? [];

  const toggleCategory = (groupKey: string) => {
    const next = hidden.includes(groupKey)
      ? hidden.filter((k) => k !== groupKey)
      : [...hidden, groupKey];
    updateSettings.mutate(next);
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [styles.headerBack, pressed && { opacity: 0.5 }]}
        >
          <ChevronLeft size={24} color="#191f28" />
        </Pressable>
        <Text style={styles.headerTitle}>가계부 공유 설정</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 60 }}>
        <Text style={styles.desc}>
          방 멤버들에게 숨길 카테고리를 선택하세요.{"\n"}선택하지 않은 카테고리는 모두 공개됩니다.
        </Text>

        <Text style={styles.sectionLabel}>숨길 카테고리</Text>
        <View style={styles.card}>
          {categoryGroups.map((group, index) => {
            const isHidden = hidden.includes(group.groupKey);
            return (
              <View key={group.groupKey}>
                {index > 0 && <View style={styles.divider} />}
                <Pressable
                  onPress={() => toggleCategory(group.groupKey)}
                  style={({ pressed }) => [styles.row, pressed && { backgroundColor: "#f9fafb" }]}
                >
                  <View style={[styles.iconBox, { backgroundColor: group.color + "22" }]}>
                    <CategoryIcon emoji={getIcon(group.groupKey)} color={group.color} size={17} />
                  </View>
                  <Text style={styles.rowLabel}>{group.label}</Text>
                  <View style={[styles.checkCircle, isHidden && styles.checkCircleOn]}>
                    {isHidden && <Text style={styles.checkMark}>✓</Text>}
                  </View>
                </Pressable>
              </View>
            );
          })}
        </View>
        <Text style={styles.footer}>
          숨긴 카테고리의 지출은 방 멤버에게 보이지 않아요.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f9fafb" },
  header: {
    height: 56, flexDirection: "row", alignItems: "center",
    justifyContent: "space-between", paddingHorizontal: 8, backgroundColor: "#f9fafb",
  },
  headerBack: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 17, fontWeight: "700", color: "#191f28" },
  scroll: { paddingHorizontal: 20, paddingTop: 8 },
  desc: { fontSize: 13, color: "#8b95a1", lineHeight: 20, marginBottom: 20 },
  sectionLabel: { fontSize: 12, fontWeight: "700", color: "#8b95a1", marginBottom: 8, marginLeft: 4 },
  card: {
    backgroundColor: "#fff", borderRadius: 16,
    borderWidth: 1, borderColor: "#f2f4f6", overflow: "hidden",
  },
  divider: { height: 1, backgroundColor: "#f2f4f6", marginLeft: 68 },
  row: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 16, paddingVertical: 14, gap: 12, minHeight: 60,
  },
  iconBox: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  rowLabel: { flex: 1, fontSize: 15, fontWeight: "600", color: "#191f28" },
  checkCircle: {
    width: 22, height: 22, borderRadius: 11,
    borderWidth: 1.5, borderColor: "#d1d6db",
    alignItems: "center", justifyContent: "center",
  },
  checkCircleOn: { backgroundColor: "#f04452", borderColor: "#f04452" },
  checkMark: { color: "#fff", fontSize: 12, fontWeight: "700" },
  footer: { fontSize: 12, color: "#adb5bd", marginTop: 8, marginLeft: 4 },
});
