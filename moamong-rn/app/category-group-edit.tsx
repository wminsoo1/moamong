import { useState, useCallback } from "react";
import { View, Text, ScrollView, Pressable, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { CategoryIcon } from "@/src/components/CategoryIcon";
import { IconGrid, ColorPicker, GROUP_ICONS } from "@/src/components/CategoryForm";
import { CategoryGroup } from "@/src/features/user/types";
import { useGroupSettings } from "@/src/features/user/hooks/useGroupSettings";

export default function CategoryGroupEditScreen() {
  const { group } = useLocalSearchParams<{ group: string }>();
  const catGroup = group as CategoryGroup;
  const insets = useSafeAreaInsets();
  const { getColor, getIcon, getLabel, updateGroup } = useGroupSettings();

  const [catEmoji, setCatEmoji] = useState(getIcon(catGroup));
  const [catColor, setCatColor] = useState(getColor(catGroup));

  const handleSelectEmoji = useCallback((name: string) => setCatEmoji(name), []);
  const handleSelectColor = useCallback((color: string) => setCatColor(color), []);

  const handleSave = () => {
    updateGroup(catGroup, catColor, catEmoji);
    router.back();
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#ffffff" }}>
      <View style={[styles.header, { paddingTop: insets.top + 8, height: insets.top + 60, paddingHorizontal: 20 }]}>
        <View style={{ flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <Pressable onPress={() => router.back()} style={({ pressed }) => [styles.headerBtn, pressed && { opacity: 0.5 }]}>
            <ChevronLeft size={28} color="#191f28" />
          </Pressable>
          <Text style={styles.headerTitle}>{getLabel(catGroup)} 수정</Text>
          <View style={{ width: 40 }} />
        </View>
      </View>

      <ScrollView style={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.previewArea}>
          <View style={[styles.previewIcon, { backgroundColor: catColor }]}>
            <CategoryIcon emoji={catEmoji} color={catColor} isWhite size={32} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>색상</Text>
          <ColorPicker selectedColor={catColor} onSelect={handleSelectColor} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>아이콘</Text>
          <IconGrid
            selectedEmoji={catEmoji}
            selectedColor={catColor}
            onSelect={handleSelectEmoji}
            icons={GROUP_ICONS[catGroup]}
          />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          disabled={!catEmoji}
          onPress={handleSave}
          style={({ pressed }) => [
            styles.submitBtn,
            { backgroundColor: catColor },
            !catEmoji && styles.btnDisabled,
            pressed && { opacity: 0.8 },
          ]}
        >
          <Text style={styles.submitText}>저장하기</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#f2f4f6", justifyContent: "center" },
  headerBtn: { width: 40, height: 40, alignItems: "flex-start", justifyContent: "center" },
  headerTitle: { fontSize: 17, fontWeight: "700", color: "#191f28", textAlign: "center" },
  scroll: { flex: 1, paddingHorizontal: 20, paddingTop: 24 },
  section: { marginBottom: 28 },
  sectionLabel: { fontSize: 12, fontWeight: "700", color: "#adb5bd", textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 },
  previewArea: { alignItems: "center", marginBottom: 28 },
  previewIcon: { width: 80, height: 80, borderRadius: 24, alignItems: "center", justifyContent: "center" },
  footer: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 16, backgroundColor: "#fff", borderTopWidth: 1, borderTopColor: "#f2f4f6" },
  submitBtn: { height: 52, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  submitText: { fontSize: 16, fontWeight: "700", color: "#fff" },
  btnDisabled: { opacity: 0.3 },
});
