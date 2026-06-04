import { View, Text, ScrollView, Pressable, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { CategoryGroup } from "@/src/features/user/types";
import { CategoryIcon } from "@/src/components/CategoryIcon";
import { useGroupSettings } from "@/src/features/user/hooks/useGroupSettings";
import { CATEGORY_COLORS, PREDEFINED_ICON_NAMES } from "@/src/components/CategoryForm";

export default function GroupEditScreen() {
  const { group: groupParam } = useLocalSearchParams<{ group: string }>();
  const insets = useSafeAreaInsets();
  const { getColor, getIcon, getLabel, updateGroup } = useGroupSettings();

  const group = groupParam as CategoryGroup;
  const currentColor = getColor(group);
  const currentIcon = getIcon(group);
  const currentLabel = getLabel(group);

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <View style={[styles.header, { paddingTop: insets.top + 8, height: insets.top + 60 }]}>
        <Pressable onPress={() => router.back()} style={({ pressed }) => [styles.headerBtn, pressed && { opacity: 0.5 }]}>
          <ChevronLeft size={28} color="#191f28" />
        </Pressable>
        <Text style={styles.headerTitle}>분류 수정</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* 미리보기 */}
        <View style={styles.previewArea}>
          <View style={[styles.previewIcon, { backgroundColor: currentColor }]}>
            <CategoryIcon emoji={currentIcon} color="#fff" isWhite size={32} />
          </View>
          <Text style={styles.previewLabel}>{currentLabel}</Text>
        </View>

        {/* 색상 */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>색상</Text>
          <View style={styles.colorRow}>
            {CATEGORY_COLORS.map((c) => (
              <Pressable
                key={c}
                onPress={() => updateGroup(group, c, currentIcon)}
                style={[
                  styles.colorDot,
                  { backgroundColor: c },
                  currentColor === c && styles.colorDotSelected,
                ]}
              />
            ))}
          </View>
        </View>

        {/* 아이콘 */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>아이콘</Text>
          <View style={styles.iconGrid}>
            {PREDEFINED_ICON_NAMES.map((iconName) => {
              const isSelected = currentIcon === iconName;
              return (
                <Pressable
                  key={iconName}
                  onPress={() => updateGroup(group, currentColor, iconName)}
                  style={[styles.iconCell, { backgroundColor: isSelected ? currentColor : "#f2f4f6" }]}
                >
                  <CategoryIcon emoji={iconName} color={isSelected ? "#fff" : "#8b95a1"} isWhite={isSelected} size={20} />
                </Pressable>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#f2f4f6", flexDirection: "row", alignItems: "center", paddingHorizontal: 20 },
  headerBtn: { width: 40, height: 40, alignItems: "flex-start", justifyContent: "center" },
  headerTitle: { flex: 1, fontSize: 17, fontWeight: "700", color: "#191f28", textAlign: "center" },
  scroll: { flex: 1, paddingHorizontal: 20, paddingTop: 24 },
  section: { marginBottom: 28 },
  sectionLabel: { fontSize: 12, fontWeight: "700", color: "#adb5bd", textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 },
  previewArea: { alignItems: "center", marginBottom: 32 },
  previewIcon: { width: 72, height: 72, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  previewLabel: { fontSize: 16, fontWeight: "700", color: "#191f28", marginTop: 10 },
  colorRow: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  colorDot: { width: 36, height: 36, borderRadius: 18 },
  colorDotSelected: { borderWidth: 3, borderColor: "#fff", shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 4, shadowOffset: { width: 0, height: 1 }, elevation: 3 },
  iconGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  iconCell: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
});
