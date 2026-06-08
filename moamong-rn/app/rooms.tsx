import { useState } from "react";
import { router } from "expo-router";
import {
  View, Text, ScrollView, Pressable, StyleSheet,
  Modal, TextInput, KeyboardAvoidingView, Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Users, ChevronRight, ChevronLeft, Plus } from "lucide-react-native";
import { useRooms } from "@/src/features/room/queries/useRooms";
import { useCreateRoom } from "@/src/features/room/mutations/useCreateRoom";
import { useJoinRoom } from "@/src/features/room/mutations/useJoinRoom";
import { useCurrentUser } from "@/src/features/user/queries/useCurrentUser";

const COLORS = ["#5B5FC7", "#107C10", "#C43E1C", "#038387", "#8764B8", "#881798", "#004E8C"];
const getColor = (id: number) => COLORS[id % COLORS.length];

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

export default function RoomsScreen() {
  const [createOpen, setCreateOpen] = useState(false);
  const [joinOpen, setJoinOpen] = useState(false);

  const { rooms, isLoading } = useRooms();
  const { user: me } = useCurrentUser();
  const createRoom = useCreateRoom();
  const joinRoom = useJoinRoom();

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.5 }]}>
          <ChevronLeft size={28} color="#191f28" />
        </Pressable>
        <Text style={styles.headerTitle}>방 관리</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {isLoading ? (
          <Text style={styles.placeholder}>불러오는 중...</Text>
        ) : rooms.length === 0 ? (
          <Text style={styles.placeholder}>참여 중인 방이 없어요</Text>
        ) : (
          <View style={styles.section}>
            {rooms.map((room, idx) => {
              const color = room.isSystem ? "#3182f6" : getColor(room.id);
              return (
                <View key={room.id}>
                  {idx > 0 && <View style={styles.sep} />}
                  <Pressable
                    onPress={room.isSystem ? undefined : () => router.push({
                      pathname: "/room-detail/[roomId]",
                      params: {
                        roomId: String(room.id),
                        name: room.name,
                        inviteCode: room.inviteCode ?? "",
                        createdBy: String(room.createdBy),
                        isSystem: String(room.isSystem),
                      },
                    })}
                    style={({ pressed }) => [styles.row, !room.isSystem && pressed && { backgroundColor: "#f8f9fa" }]}
                  >
                    <View style={[styles.icon, { backgroundColor: color }]}>
                      <Text style={styles.iconText}>{room.name.charAt(0)}</Text>
                    </View>
                    <View style={styles.rowContent}>
                      <View style={styles.rowTitleRow}>
                        <Text style={styles.rowTitle}>{room.name}</Text>
                        {room.createdBy === me?.id && (
                          <View style={styles.ownerBadge}>
                            <Text style={styles.ownerBadgeText}>방장</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.rowSub} numberOfLines={1}>
                        {room.isSystem ? "전체 공개 방" : room.inviteCode}
                      </Text>
                    </View>
                    {!room.isSystem && <ChevronRight size={16} color="#c9cdd2" strokeWidth={2} />}
                  </Pressable>
                </View>
              );
            })}
          </View>
        )}

        <View style={styles.section}>
          <Pressable
            onPress={() => setCreateOpen(true)}
            style={({ pressed }) => [styles.row, pressed && { backgroundColor: "#f8f9fa" }]}
          >
            <View style={[styles.icon, { backgroundColor: "#e8f3ff" }]}>
              <Plus size={20} color="#3182f6" strokeWidth={2.5} />
            </View>
            <Text style={[styles.rowTitle, { flex: 1 }]}>새로운 방 만들기</Text>
            <ChevronRight size={16} color="#c9cdd2" strokeWidth={2} />
          </Pressable>
          <View style={styles.sep} />
          <Pressable
            onPress={() => setJoinOpen(true)}
            style={({ pressed }) => [styles.row, pressed && { backgroundColor: "#f8f9fa" }]}
          >
            <View style={[styles.icon, { backgroundColor: "#f2f4f6" }]}>
              <Users size={16} color="#8b95a1" />
            </View>
            <Text style={[styles.rowTitle, { flex: 1 }]}>초대 코드로 참여하기</Text>
            <ChevronRight size={16} color="#c9cdd2" strokeWidth={2} />
          </Pressable>
        </View>

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
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#f2f4f6" },
  backBtn: { width: 40, height: 40, alignItems: "flex-start", justifyContent: "center" },
  headerTitle: { fontSize: 17, fontWeight: "700", color: "#191f28" },
  scroll: { paddingHorizontal: 16, paddingTop: 4 },
  placeholder: { textAlign: "center", color: "#adb5bd", fontSize: 14, paddingVertical: 40 },
  section: { backgroundColor: "#fff", borderRadius: 16, overflow: "hidden", marginBottom: 12 },
  sep: { height: StyleSheet.hairlineWidth, backgroundColor: "#e5e8eb", marginLeft: 72 },
  row: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 13, gap: 12 },
  icon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  iconText: { fontSize: 16, fontWeight: "700", color: "#fff" },
  rowTitleRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  ownerBadge: { backgroundColor: "#e8f3ff", borderRadius: 5, paddingHorizontal: 6, paddingVertical: 2 },
  ownerBadgeText: { fontSize: 11, fontWeight: "700", color: "#3182f6" },
  rowContent: { flex: 1 },
  rowTitle: { fontSize: 16, fontWeight: "600", color: "#191f28" },
  rowSub: { fontSize: 12, color: "#adb5bd", marginTop: 1, letterSpacing: 0.3 },
});
