import { useState, useEffect, useMemo } from "react";
import {
  View, Text, Pressable, TextInput, ScrollView,
  StyleSheet, Switch, KeyboardAvoidingView, Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { useRooms } from "@/src/features/room/queries/useRooms";
import { useShareHotItem } from "@/src/features/feed/mutations/useShareHotItem";
import { SYSTEM_CATEGORIES, SystemCategoryKey } from "@/src/features/feed/types";
import { CategoryIcon } from "@/src/components/CategoryIcon";
import { LinkInput } from "@/src/components/LinkInput";
import { useInitialShareUrl } from "@/src/features/feed/hooks/useInitialShareUrl";

type CategoryEnum = SystemCategoryKey;

export default function ShareItemScreen() {
  const { shareUrl: initialUrl } = useLocalSearchParams<{ shareUrl?: string }>();
  const { rooms } = useRooms();
  const shareHotItem = useShareHotItem();

  const resolvedInitialUrl = useInitialShareUrl(initialUrl);

  const [shareUrl, setShareUrl] = useState("");
  const [shareTitle, setShareTitle] = useState<string | null>(null);
  const [shareImageUrl, setShareImageUrl] = useState<string | null>(null);
  const [shareRoomIds, setShareRoomIds] = useState<number[]>([]);
  const [shareIsPublic, setShareIsPublic] = useState(false);
  const [shareCategory, setShareCategory] = useState<CategoryEnum>("ETC");
  const [shareAmount, setShareAmount] = useState("");
  const [shareReview, setShareReview] = useState("");

  const shareAmountDisplay = useMemo(
    () => (shareAmount ? parseInt(shareAmount, 10).toLocaleString() : ""),
    [shareAmount]
  );

  useEffect(() => {
    setShareRoomIds(rooms.map((r) => r.id));
  }, [rooms]);

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [styles.headerBack, pressed && { opacity: 0.5 }]}
        >
          <ChevronLeft size={28} color="#191f28" />
        </Pressable>
        <Text style={styles.headerTitle}>핫템 공유하기</Text>
        <View style={{ width: 44 }} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView style={styles.scroll} keyboardShouldPersistTaps="handled">
          <LinkInput
            initialUrl={resolvedInitialUrl || undefined}
            onChange={({ url, title, imageUrl }) => {
              setShareUrl(url);
              setShareTitle(title);
              setShareImageUrl(imageUrl);
            }}
          />

          <View style={styles.inputRow}>
            <TextInput
              style={styles.amountInput}
              placeholder="금액을 입력해주세요 (필수)"
              placeholderTextColor="#c9cdd2"
              keyboardType="numeric"
              value={shareAmountDisplay}
              onChangeText={(t) => setShareAmount(t.replace(/[^0-9]/g, ""))}
            />
            <Text style={styles.unitText}>원</Text>
          </View>

          <View style={styles.inputRow}>
            <TextInput
              style={[styles.textInput, { flex: 1 }]}
              placeholder="한 줄 후기를 남겨주세요 (선택)"
              placeholderTextColor="#c9cdd2"
              value={shareReview}
              onChangeText={setShareReview}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>카테고리 <Text style={{ color: "#f04452" }}>*</Text></Text>
            <View style={styles.catChips}>
              {SYSTEM_CATEGORIES.map((cat) => {
                const isSelected = shareCategory === cat.key;
                return (
                  <Pressable
                    key={cat.key}
                    onPress={() => setShareCategory(cat.key as CategoryEnum)}
                    style={[styles.catChip, { backgroundColor: isSelected ? cat.color : "#f2f4f6" }]}
                  >
                    <CategoryIcon emoji={cat.emoji} color={isSelected ? "#fff" : cat.color} isWhite={isSelected} size={14} />
                    <Text style={[styles.catChipText, { color: isSelected ? "#fff" : "#8b95a1" }]}>{cat.name}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionLabel}>공유 범위</Text>
              <View style={styles.publicToggleRow}>
                <Text style={styles.publicToggleLabel}>전체 공개</Text>
                <Switch
                  value={shareIsPublic}
                  onValueChange={setShareIsPublic}
                  trackColor={{ false: "#e5e8eb", true: "#3182f6" }}
                  thumbColor="#fff"
                  ios_backgroundColor="#e5e8eb"
                />
              </View>
            </View>

            {rooms.map((room) => {
              const checked = shareIsPublic || shareRoomIds.includes(room.id);
              return (
                <Pressable
                  key={room.id}
                  onPress={() => !shareIsPublic && setShareRoomIds(p => p.includes(room.id) ? p.filter(id => id !== room.id) : [...p, room.id])}
                  style={[styles.roomRow, shareIsPublic && { opacity: 0.35 }]}
                >
                  <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
                    {checked && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.roomName}>{room.name}</Text>
                    {room.isSystem && (
                      <Text style={{ fontSize: 11, color: "#adb5bd", marginTop: 1 }}>모두가 볼 수 있는 기본 방</Text>
                    )}
                  </View>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={styles.footer}>
        <Pressable
          disabled={!shareUrl || (!shareIsPublic && shareRoomIds.length === 0) || shareHotItem.isPending}
          onPress={() =>
            shareHotItem.mutate(
              {
                url: shareUrl,
                amount: parseInt(shareAmount) || 0,
                roomIds: shareRoomIds,
                category: shareCategory,
                title: shareTitle ?? "",
                imageUrl: shareImageUrl,
                review: shareReview,
                isPublic: shareIsPublic,
              },
              { onSuccess: () => router.back() }
            )
          }
          style={[
            styles.primaryBtn,
            (!shareUrl || shareRoomIds.length === 0 || shareHotItem.isPending) && styles.btnDisabled,
          ]}
        >
          <Text style={styles.primaryBtnText}>
            {shareHotItem.isPending ? "공유 중..." : "공유하기"}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, height: 56, borderBottomWidth: 1, borderBottomColor: "#f2f4f6" },
  headerBack: { width: 44, height: 44, alignItems: "flex-start", justifyContent: "center" },
  headerTitle: { fontSize: 17, fontWeight: "700", color: "#191f28" },
  scroll: { flex: 1, paddingHorizontal: 20 },
  inputRow: { flexDirection: "row", alignItems: "center", borderBottomWidth: 1, borderBottomColor: "#e5e8eb", paddingBottom: 16, marginBottom: 20 },
  amountInput: { flex: 1, fontSize: 20, fontWeight: "600", color: "#191f28" },
  unitText: { fontSize: 20, fontWeight: "600", color: "#8b95a1", marginLeft: 4 },
  textInput: { flex: 1, fontSize: 20, fontWeight: "600", color: "#191f28", paddingVertical: 0 },
  section: { marginBottom: 24 },
  sectionHeaderRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  sectionLabel: { fontSize: 12, fontWeight: "700", color: "#adb5bd", textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 },
  publicToggleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  publicToggleLabel: { fontSize: 13, fontWeight: "600", color: "#4e5968" },
  catChips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  catChip: { flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, gap: 6 },
  catChipText: { fontSize: 14, fontWeight: "600" },
  roomRow: { flexDirection: "row", alignItems: "center", gap: 12, padding: 12, backgroundColor: "#f9fafb", borderRadius: 12, marginBottom: 8 },
  checkbox: { width: 20, height: 20, borderRadius: 4, borderWidth: 2, borderColor: "#d1d6db", alignItems: "center", justifyContent: "center" },
  checkboxChecked: { backgroundColor: "#3182f6", borderColor: "#3182f6" },
  checkmark: { color: "#fff", fontSize: 12, fontWeight: "700" },
  roomName: { fontSize: 15, fontWeight: "600", color: "#4e5968" },
  footer: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 20, borderTopWidth: 1, borderTopColor: "#f2f4f6" },
  primaryBtn: { height: 52, borderRadius: 16, backgroundColor: "#3182f6", alignItems: "center", justifyContent: "center" },
  primaryBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  btnDisabled: { opacity: 0.3 },
});
