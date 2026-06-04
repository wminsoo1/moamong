import {
  View, Text, Pressable, TextInput, ScrollView,
  KeyboardAvoidingView, Switch, StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { CategoryIcon } from "@/src/components/CategoryIcon";
import { LinkInput } from "@/src/components/LinkInput";
import { SYSTEM_CATEGORIES } from "@/src/features/feed/types";
import { useRooms } from "@/src/features/room/queries/useRooms";
import { useCreateSharedItem } from "@/src/features/feed/mutations/useCreateSharedItem";
import { useState } from "react";

export default function ShareSpendingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const spendingId = parseInt(id, 10);

  const [linkResult, setLinkResult] = useState<{ url: string; title: string | null; imageUrl: string | null }>({ url: "", title: null, imageUrl: null });
  const [shareCategory, setShareCategory] = useState("");
  const [sharedToAll, setSharedToAll] = useState(false);
  const [selectedRoomIds, setSelectedRoomIds] = useState<number[]>([]);
  const [review, setReview] = useState("");

  const { rooms } = useRooms();
  const createSharedItem = useCreateSharedItem();

  const toggleRoomId = (roomId: number) =>
    setSelectedRoomIds((prev) =>
      prev.includes(roomId) ? prev.filter((r) => r !== roomId) : [...prev, roomId]
    );

  const canSubmit = linkResult.url.trim() !== "" && shareCategory !== "" && (sharedToAll || selectedRoomIds.length > 0);

  const handleShare = () => {
    const roomIds = sharedToAll ? rooms.map((r) => r.id) : selectedRoomIds;
    createSharedItem.mutate({
      spendingId,
      url: linkResult.url,
      category: shareCategory,
      roomIds,
      isPublic: sharedToAll,
      title: linkResult.title || "공유된 아이템",
      imageUrl: linkResult.imageUrl,
      review: review || null,
    }, {
      onSuccess: () => router.replace("/(tabs)/calendar"),
    });
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={({ pressed }) => [styles.headerSideBtn, pressed && { opacity: 0.5 }]}>
          <ChevronLeft size={28} color="#191f28" />
        </Pressable>
        <Text style={styles.headerTitle}>피드에 공유하기</Text>
        <View style={{ width: 44 }} />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
        <ScrollView style={styles.scroll} keyboardShouldPersistTaps="handled">
          <LinkInput onChange={setLinkResult} />

          <View style={[styles.inputRow, { marginTop: 8 }]}>
            <TextInput style={[styles.textInput, { flex: 1 }]} placeholder="한 줄 후기를 남겨주세요 (선택)" placeholderTextColor="#c9cdd2" value={review} onChangeText={setReview} />
          </View>

          <View style={styles.catSection}>
            <Text style={styles.catSectionLabel}>카테고리 <Text style={{ color: "#f04452" }}>*</Text></Text>
            <View style={styles.catChips}>
              {SYSTEM_CATEGORIES.map((cat) => {
                const isSelected = shareCategory === cat.key;
                return (
                  <Pressable key={cat.key} onPress={() => setShareCategory(cat.key)} style={[styles.catChip, { backgroundColor: isSelected ? cat.color : "#f2f4f6" }]}>
                    <CategoryIcon emoji={cat.emoji} color={isSelected ? "#fff" : cat.color} isWhite={isSelected} size={14} />
                    <Text style={[styles.catChipText, { color: isSelected ? "#fff" : "#8b95a1" }]}>{cat.name}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={styles.catSection}>
            <View style={styles.catSectionHeader}>
              <Text style={styles.catSectionLabel}>공유 범위</Text>
              <View style={styles.publicToggleRow}>
                <Text style={styles.publicToggleLabel}>전체 공개</Text>
                <Switch value={sharedToAll} onValueChange={setSharedToAll} trackColor={{ false: "#e5e8eb", true: "#3182f6" }} thumbColor="#fff" ios_backgroundColor="#e5e8eb" />
              </View>
            </View>
            {rooms.map((room) => {
              const checked = sharedToAll || selectedRoomIds.includes(room.id);
              return (
                <Pressable key={room.id} onPress={() => !sharedToAll && toggleRoomId(room.id)} style={[styles.roomRow, sharedToAll && { opacity: 0.35 }]}>
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
        {createSharedItem.error && (
          <Text style={styles.errorText}>{(createSharedItem.error as Error).message || "저장 중 오류가 발생했습니다."}</Text>
        )}
        <Pressable
          disabled={!canSubmit || createSharedItem.isPending}
          onPress={handleShare}
          style={({ pressed }) => [styles.primaryBtn, (!canSubmit || createSharedItem.isPending) && styles.btnDisabled, pressed && { opacity: 0.8 }]}
        >
          <Text style={styles.primaryBtnText}>{createSharedItem.isPending ? "저장 중..." : "공유하고 기록하기"}</Text>
        </Pressable>
        <Pressable onPress={() => router.back()} style={({ pressed }) => [styles.secondaryBtn, pressed && { opacity: 0.6 }]}>
          <Text style={styles.secondaryBtnText}>취소</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#ffffff" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, height: 56, borderBottomWidth: 1, borderBottomColor: "#f2f4f6" },
  headerSideBtn: { width: 44, height: 44, alignItems: "flex-start", justifyContent: "center" },
  headerTitle: { fontSize: 17, fontWeight: "700", color: "#191f28" },
  scroll: { flex: 1, paddingHorizontal: 20 },
  inputRow: { flexDirection: "row", alignItems: "center", borderBottomWidth: 1, borderBottomColor: "#e5e8eb", paddingBottom: 16, marginBottom: 20 },
  textInput: { flex: 1, fontSize: 20, fontWeight: "600", color: "#191f28", paddingVertical: 0 },
  catSection: { marginBottom: 24 },
  catSectionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  publicToggleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  publicToggleLabel: { fontSize: 13, fontWeight: "600", color: "#4e5968" },
  catSectionLabel: { fontSize: 12, fontWeight: "700", color: "#adb5bd", textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 },
  catChips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  catChip: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20 },
  catChipText: { fontSize: 14, fontWeight: "600" },
  roomRow: { flexDirection: "row", alignItems: "center", gap: 12, padding: 12, borderRadius: 12, backgroundColor: "#f9fafb", marginBottom: 8 },
  checkbox: { width: 20, height: 20, borderRadius: 4, borderWidth: 2, borderColor: "#d1d6db", alignItems: "center", justifyContent: "center" },
  checkboxChecked: { backgroundColor: "#3182f6", borderColor: "#3182f6" },
  checkmark: { color: "#fff", fontSize: 12, fontWeight: "700" },
  roomName: { fontSize: 15, fontWeight: "600", color: "#4e5968" },
  footer: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 20, borderTopWidth: 1, borderTopColor: "#f2f4f6", gap: 8 },
  errorText: { fontSize: 12, color: "#f04452", textAlign: "center" },
  primaryBtn: { height: 52, borderRadius: 16, backgroundColor: "#3182f6", alignItems: "center", justifyContent: "center" },
  primaryBtnText: { fontSize: 16, fontWeight: "700", color: "#fff" },
  btnDisabled: { opacity: 0.3 },
  secondaryBtn: { height: 40, alignItems: "center", justifyContent: "center" },
  secondaryBtnText: { fontSize: 14, fontWeight: "600", color: "#3182f6" },
  ogPreview: { flexDirection: "row", alignItems: "center", gap: 12, padding: 12, backgroundColor: "#f9fafb", borderRadius: 12, borderWidth: 1, borderColor: "#e5e8eb", marginBottom: 20 },
  ogImage: { width: 56, height: 56, borderRadius: 8 },
  ogTitle: { flex: 1, fontSize: 14, fontWeight: "600", color: "#191f28" },
});
