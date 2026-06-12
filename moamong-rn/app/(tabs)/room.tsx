import { useState, useCallback } from "react";
import { router, useFocusEffect } from "expo-router";
import {
  View, Text, ScrollView, Pressable, StyleSheet,
  Modal, TextInput, KeyboardAvoidingView, Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Users, Plus, LogIn, BellOff } from "lucide-react-native";
import { useRooms } from "@/src/features/room/queries/useRooms";
import { useCreateRoom } from "@/src/features/room/mutations/useCreateRoom";
import { useJoinRoom } from "@/src/features/room/mutations/useJoinRoom";
import { parseISO, isToday, isThisYear, format } from "date-fns";
import { ko } from "date-fns/locale";

const COLORS = ["#5B5FC7", "#107C10", "#C43E1C", "#038387", "#8764B8", "#881798", "#004E8C"];
const getColor = (id: number) => COLORS[id % COLORS.length];

function formatLastTime(iso: string): string {
  const date = parseISO(iso);
  if (isToday(date)) return format(date, "a h:mm", { locale: ko });
  if (isThisYear(date)) return format(date, "M월 d일", { locale: ko });
  return format(date, "yyyy. M. d.", { locale: ko });
}

interface InputDialogProps {
  visible: boolean;
  title: string;
  placeholder: string;
  confirmLabel: string;
  isPending?: boolean;
  error?: string | null;
  autoCapitalize?: "none" | "characters" | "words" | "sentences";
  onConfirm: (value: string) => void;
  onCancel: () => void;
}

function InputDialog({ visible, title, placeholder, confirmLabel, isPending, error, autoCapitalize = "none", onConfirm, onCancel }: InputDialogProps) {
  const [value, setValue] = useState("");
  const handleCancel = () => { setValue(""); onCancel(); };
  const handleConfirm = () => { if (value.trim() && !isPending) onConfirm(value.trim()); };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleCancel}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={d.overlay} keyboardVerticalOffset={100}>
        <Pressable style={StyleSheet.absoluteFill} onPress={handleCancel} />
        <View style={d.card}>
          <Text style={d.title}>{title}</Text>
          <TextInput
            style={d.input}
            placeholder={placeholder}
            placeholderTextColor="#c9cdd2"
            value={value}
            onChangeText={setValue}
            autoFocus
            autoCapitalize={autoCapitalize}
            returnKeyType="done"
            onSubmitEditing={handleConfirm}
          />
          {!!error && <Text style={d.errorText}>{error}</Text>}
          <View style={d.btnRow}>
            <Pressable onPress={handleCancel} style={({ pressed }) => [d.btnCancel, pressed && { opacity: 0.7 }]}>
              <Text style={d.cancelText}>취소</Text>
            </Pressable>
            <Pressable
              onPress={handleConfirm}
              disabled={!value.trim() || isPending}
              style={({ pressed }) => [d.btnConfirm, (!value.trim() || isPending) && { opacity: 0.4 }, pressed && { opacity: 0.8 }]}
            >
              <Text style={d.confirmText}>{isPending ? "처리 중..." : confirmLabel}</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const d = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "flex-end", paddingHorizontal: 16, paddingBottom: 16 },
  card: { backgroundColor: "#fff", borderRadius: 24, paddingHorizontal: 24, paddingTop: 32, paddingBottom: 24 },
  title: { fontSize: 20, fontWeight: "700", color: "#191f28", marginBottom: 16 },
  input: { height: 54, backgroundColor: "#f2f4f6", borderRadius: 14, paddingHorizontal: 18, fontSize: 16, color: "#191f28", marginBottom: 16 },
  btnRow: { flexDirection: "row", gap: 10 },
  btnCancel: { flex: 1, height: 54, borderRadius: 14, backgroundColor: "#f2f4f6", alignItems: "center", justifyContent: "center" },
  cancelText: { fontSize: 16, fontWeight: "600", color: "#8b95a1" },
  btnConfirm: { flex: 1, height: 54, borderRadius: 14, backgroundColor: "#3182f6", alignItems: "center", justifyContent: "center" },
  confirmText: { fontSize: 16, fontWeight: "700", color: "#fff" },
  errorText: { fontSize: 13, color: "#f04452", textAlign: "center", marginBottom: 12 },
});

export default function HomeScreen() {
  const [createOpen, setCreateOpen] = useState(false);
  const [joinOpen, setJoinOpen] = useState(false);

  const { rooms, isLoading, refetch } = useRooms();
  const createRoom = useCreateRoom();
  const joinRoom = useJoinRoom();

  useFocusEffect(useCallback(() => { refetch(); }, [refetch]));

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>방</Text>
        <View style={styles.headerActions}>
          <Pressable
            onPress={() => setJoinOpen(true)}
            style={({ pressed }) => [styles.headerBtn, pressed && { opacity: 0.6 }]}
          >
            <LogIn size={20} color="#3182f6" strokeWidth={2} />
          </Pressable>
          <Pressable
            onPress={() => setCreateOpen(true)}
            style={({ pressed }) => [styles.headerBtn, styles.headerBtnPrimary, pressed && { opacity: 0.8 }]}
          >
            <Plus size={18} color="#fff" strokeWidth={2.5} />
          </Pressable>
        </View>
      </View>

<ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {isLoading ? (
          <Text style={styles.placeholder}>불러오는 중...</Text>
        ) : rooms.filter(r => !r.isSystem).length === 0 ? (
          <Text style={styles.placeholder}>참여 중인 방이 없어요</Text>
        ) : (
          <View style={styles.section}>
            {rooms.filter(room => !room.isSystem).map((room, idx) => {
              const color = getColor(room.id);
              return (
                <View key={room.id}>
                  {idx > 0 && <View style={styles.sep} />}
                  <Pressable
                    onPress={() => router.push({
                      pathname: "/room-spending/[roomId]",
                      params: { roomId: String(room.id), name: room.name, inviteCode: room.inviteCode ?? "", createdBy: String(room.createdBy) },
                    })}
                    style={({ pressed }) => [styles.row, pressed && { backgroundColor: "#f8f9fa" }]}
                  >
                    <View style={[styles.icon, { backgroundColor: color }]}>
                      <Text style={styles.iconText}>{room.name.charAt(0)}</Text>
                    </View>
                    <View style={styles.rowContent}>
                      <View style={styles.nameRow}>
                        <Text style={styles.rowTitle}>{room.name}</Text>
                        <Users size={11} color="#adb5bd" strokeWidth={2} />
                        <Text style={styles.memberCount}>{room.memberCount}</Text>
                        {room.notificationEnabled === false && <BellOff size={11} color="#adb5bd" strokeWidth={2} />}
                      </View>
                      {room.lastSpendingPreview && (
                        <Text style={styles.previewText} numberOfLines={1}>{room.lastSpendingPreview}</Text>
                      )}
                    </View>
                    <View style={styles.rowRight}>
                      {room.lastSpendingAt && (
                        <Text style={styles.lastTime}>{formatLastTime(room.lastSpendingAt)}</Text>
                      )}
                      {room.unreadSpendingCount > 0 && (
                        <View style={styles.badge}>
                          <Text style={styles.badgeText}>
                            {room.unreadSpendingCount > 99 ? "99+" : room.unreadSpendingCount}
                          </Text>
                        </View>
                      )}
                    </View>
                  </Pressable>
                </View>
              );
            })}
          </View>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      <InputDialog
        visible={createOpen}
        title="새로운 방 만들기"
        placeholder="방 이름을 입력하세요"
        confirmLabel="만들기"
        isPending={createRoom.isPending}
        onCancel={() => setCreateOpen(false)}
        onConfirm={(name) => createRoom.mutate(name, { onSuccess: () => setCreateOpen(false) })}
      />
      <InputDialog
        visible={joinOpen}
        title="초대 코드로 참여"
        placeholder="초대 코드를 입력하세요"
        confirmLabel="참여하기"
        isPending={joinRoom.isPending}
        error={joinRoom.isError ? (joinRoom.error as Error)?.message : null}
        autoCapitalize="characters"
        onCancel={() => { setJoinOpen(false); joinRoom.reset(); }}
        onConfirm={(code) => { joinRoom.reset(); joinRoom.mutate(code, { onSuccess: () => { setJoinOpen(false); joinRoom.reset(); } }); }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingVertical: 16 },
  headerTitle: { fontSize: 22, fontWeight: "700", color: "#191f28" },
  headerActions: { flexDirection: "row", alignItems: "center", gap: 8 },
  headerBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: "#e8f3ff", alignItems: "center", justifyContent: "center" },
  headerBtnPrimary: { backgroundColor: "#3182f6" },
  scroll: { paddingHorizontal: 16, paddingTop: 4 },
  placeholder: { textAlign: "center", color: "#adb5bd", fontSize: 14, paddingVertical: 40 },
  section: { backgroundColor: "#fff", borderRadius: 16, overflow: "hidden", marginBottom: 12 },
  sep: { height: StyleSheet.hairlineWidth, backgroundColor: "#e5e8eb", marginLeft: 72 },
  row: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 13, gap: 12 },
  icon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  iconText: { fontSize: 16, fontWeight: "700", color: "#fff" },
  rowContent: { flex: 1 },
  rowTitle: { fontSize: 16, fontWeight: "600", color: "#191f28" },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  memberCount: { fontSize: 12, color: "#adb5bd", fontWeight: "500" },
  previewText: { fontSize: 13, color: "#8b95a1", marginTop: 2 },
  rowRight: { alignItems: "flex-end", gap: 4 },
  lastTime: { fontSize: 11, color: "#adb5bd" },
  badge: { backgroundColor: "#f04452", borderRadius: 10, minWidth: 20, height: 20, paddingHorizontal: 5, alignItems: "center", justifyContent: "center" },
  badgeText: { fontSize: 11, fontWeight: "700", color: "#fff" },
});
