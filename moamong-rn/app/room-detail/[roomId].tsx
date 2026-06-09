import { useState } from "react";
import { View, Text, Pressable, ScrollView, StyleSheet, Modal, TextInput, KeyboardAvoidingView, Platform, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { ChevronLeft, LogOut, Trash2, UserMinus, Copy, Pencil, RefreshCw } from "lucide-react-native";
import * as Clipboard from "expo-clipboard";
import { toast } from "@/src/lib/toast";
import { useRoomMembers } from "@/src/features/room/queries/useRoomMembers";
import { useKickMember } from "@/src/features/room/mutations/useKickMember";
import { useDeleteRoom } from "@/src/features/room/mutations/useDeleteRoom";
import { useLeaveRoom } from "@/src/features/room/mutations/useLeaveRoom";
import { useRenameRoom } from "@/src/features/room/mutations/useRenameRoom";
import { useRegenerateInviteCode } from "@/src/features/room/mutations/useRegenerateInviteCode";
import { useCurrentUser } from "@/src/features/user/queries/useCurrentUser";

const COLORS = ["#5B5FC7", "#107C10", "#C43E1C", "#038387", "#8764B8", "#881798", "#004E8C"];
const getAvatarColor = (userId: number) => COLORS[userId % COLORS.length];

interface ConfirmState {
  type: "kick" | "leave" | "delete";
  targetUserId?: number;
  targetName?: string;
}

export default function RoomDetailScreen() {
  const { roomId, name, inviteCode, createdBy, isSystem } = useLocalSearchParams<{
    roomId: string; name: string; inviteCode: string; createdBy: string; isSystem: string;
  }>();
  const rid = Number(roomId);
  const isOwner = useCurrentUser().user?.id === Number(createdBy);
  const isSystemRoom = isSystem === "true";

  const { data: members = [], isLoading } = useRoomMembers(rid);
  const { user: me } = useCurrentUser();
  const kickMember = useKickMember(rid);
  const deleteRoom = useDeleteRoom();
  const leaveRoom = useLeaveRoom();
  const renameRoom = useRenameRoom();
  const regenerateCode = useRegenerateInviteCode();
  const [currentInviteCode, setCurrentInviteCode] = useState(inviteCode);

  const [confirm, setConfirm] = useState<ConfirmState | null>(null);
  const [renameOpen, setRenameOpen] = useState(false);
  const [renameValue, setRenameValue] = useState("");
  const [roomName, setRoomName] = useState(name);

  const handleCopy = async () => {
    await Clipboard.setStringAsync(currentInviteCode);
    toast.show("초대 코드가 복사됐어요");
  };

  const handleRegenerateCode = () => {
    Alert.alert("초대 코드 재생성", "기존 코드는 사용할 수 없게 돼요. 재생성할까요?", [
      { text: "취소", style: "cancel" },
      {
        text: "재생성",
        onPress: () => regenerateCode.mutate(rid, {
          onSuccess: (data) => {
            setCurrentInviteCode(data.inviteCode);
            toast.show("초대 코드가 재생성됐어요");
          },
        }),
      },
    ]);
  };

  const handleConfirm = () => {
    if (!confirm) return;
    if (confirm.type === "kick" && confirm.targetUserId != null) {
      kickMember.mutate(confirm.targetUserId, { onSuccess: () => setConfirm(null) });
    } else if (confirm.type === "delete") {
      deleteRoom.mutate(rid, { onSuccess: () => { setConfirm(null); router.back(); } });
    } else if (confirm.type === "leave") {
      leaveRoom.mutate(rid, { onSuccess: () => { setConfirm(null); router.back(); } });
    }
  };

  const isPending = kickMember.isPending || deleteRoom.isPending || leaveRoom.isPending;

  const confirmTitle = confirm?.type === "kick"
    ? `${confirm.targetName}님 내보내기`
    : confirm?.type === "delete" ? "방 삭제" : "방 나가기";
  const confirmMessage = confirm?.type === "kick"
    ? `${confirm.targetName}님을 방에서 내보낼까요?`
    : confirm?.type === "delete" ? "방을 삭제하면 모든 내역이 사라져요." : "이 방을 나가시겠어요?";

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={({ pressed }) => [styles.headerBack, pressed && { opacity: 0.5 }]}>
          <ChevronLeft size={24} color="#191f28" />
        </Pressable>
        <Pressable
          onPress={() => { setRenameValue(roomName); setRenameOpen(true); }}
          style={styles.headerTitleBtn}
        >
          <Text style={styles.headerTitle}>{roomName}</Text>
          {!isSystemRoom && <Pencil size={13} color="#adb5bd" strokeWidth={2} />}
        </Pressable>
        {!isSystemRoom ? (
          <Pressable
            onPress={() => setConfirm({ type: isOwner ? "delete" : "leave" })}
            style={({ pressed }) => [styles.headerAction, pressed && { opacity: 0.5 }]}
          >
            {isOwner
              ? <Trash2 size={20} color="#f04452" />
              : <LogOut size={20} color="#f04452" />
            }
          </Pressable>
        ) : (
          <View style={{ width: 44 }} />
        )}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* 초대 코드 */}
        {!isSystemRoom && (
          <>
            <Text style={styles.sectionLabel}>초대 코드</Text>
            <Pressable
              onPress={handleCopy}
              style={({ pressed }) => [styles.codeCard, pressed && { opacity: 0.7 }]}
            >
              <View style={styles.codeInner}>
                <Text style={styles.codeLabel}>초대 코드</Text>
                <Text style={styles.codeValue}>{currentInviteCode}</Text>
              </View>
              <View style={styles.copyIconBox}>
                <Copy size={15} color="#8b95a1" strokeWidth={2} />
              </View>
              {isOwner && (
                <Pressable
                  onPress={handleRegenerateCode}
                  style={({ pressed }) => [styles.copyIconBox, { marginLeft: 8 }, pressed && { opacity: 0.6 }]}
                >
                  <RefreshCw size={15} color="#8b95a1" strokeWidth={2} />
                </Pressable>
              )}
            </Pressable>
          </>
        )}

        {/* 멤버 */}
        <Text style={styles.sectionLabel}>멤버</Text>
        <View style={styles.card}>
          {isLoading ? (
            <Text style={styles.empty}>불러오는 중...</Text>
          ) : members.length === 0 ? (
            <Text style={styles.empty}>멤버가 없어요</Text>
          ) : (
            members.map((member, idx) => {
              const isMe = member.userId === me?.id;
              const isMemberOwner = member.userId === Number(createdBy);
              const canKick = isOwner && !isMe && !isMemberOwner;
              return (
                <View key={member.userId}>
                  {idx > 0 && <View style={styles.divider} />}
                  <View style={styles.memberRow}>
                    <View style={[styles.avatar, { backgroundColor: getAvatarColor(member.userId) }]}>
                      <Text style={styles.avatarText}>{member.username.charAt(0)}</Text>
                    </View>
                    <Text style={styles.memberName}>{member.username}</Text>
                    {isMe && <View style={styles.badge}><Text style={styles.badgeText}>나</Text></View>}
                    {isMemberOwner && <View style={[styles.badge, styles.ownerBadge]}><Text style={[styles.badgeText, styles.ownerBadgeText]}>방장</Text></View>}
                    {canKick && (
                      <Pressable
                        onPress={() => setConfirm({ type: "kick", targetUserId: member.userId, targetName: member.username })}
                        style={({ pressed }) => [styles.kickBtn, pressed && { opacity: 0.6 }]}
                        hitSlop={8}
                      >
                        <UserMinus size={16} color="#f04452" />
                      </Pressable>
                    )}
                  </View>
                </View>
              );
            })
          )}
        </View>

        <View style={{ height: 60 }} />
      </ScrollView>

      {/* Confirm Modal */}
      <Modal visible={confirm !== null} transparent animationType="fade" onRequestClose={() => setConfirm(null)}>
        <Pressable style={styles.overlay} onPress={() => setConfirm(null)}>
          <Pressable style={styles.dialog} onPress={() => {}}>
            <Text style={styles.dialogTitle}>{confirmTitle}</Text>
            <Text style={styles.dialogMessage}>{confirmMessage}</Text>
            <View style={styles.dialogBtnRow}>
              <Pressable onPress={() => setConfirm(null)} style={({ pressed }) => [styles.dialogCancel, pressed && { opacity: 0.7 }]}>
                <Text style={styles.dialogCancelText}>취소</Text>
              </Pressable>
              <Pressable
                onPress={handleConfirm}
                disabled={isPending}
                style={({ pressed }) => [styles.dialogDanger, isPending && { opacity: 0.4 }, pressed && { opacity: 0.8 }]}
              >
                <Text style={styles.dialogDangerText}>{isPending ? "처리 중..." : "확인"}</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
      {/* Rename Modal */}
      <Modal visible={renameOpen} transparent animationType="fade" onRequestClose={() => setRenameOpen(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.overlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setRenameOpen(false)} />
          <View style={styles.dialog}>
            <Text style={styles.dialogTitle}>방 이름 변경</Text>
            <TextInput
              style={styles.renameInput}
              value={renameValue}
              onChangeText={setRenameValue}
              placeholder="방 이름을 입력하세요"
              placeholderTextColor="#c9cdd2"
              autoFocus
              maxLength={30}
              returnKeyType="done"
              onSubmitEditing={() => {
                if (!renameValue.trim() || renameRoom.isPending) return;
                renameRoom.mutate({ roomId: rid, name: renameValue.trim() }, {
                  onSuccess: () => { setRoomName(renameValue.trim()); setRenameOpen(false); },
                  onError: (e) => toast.show((e as Error).message),
                });
              }}
            />
            <View style={styles.dialogBtnRow}>
              <Pressable onPress={() => setRenameOpen(false)} style={({ pressed }) => [styles.dialogCancel, pressed && { opacity: 0.7 }]}>
                <Text style={styles.dialogCancelText}>취소</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  if (!renameValue.trim() || renameRoom.isPending) return;
                  renameRoom.mutate({ roomId: rid, name: renameValue.trim() }, {
                    onSuccess: () => { setRoomName(renameValue.trim()); setRenameOpen(false); },
                    onError: (e) => toast.show((e as Error).message),
                  });
                }}
                disabled={!renameValue.trim() || renameRoom.isPending}
                style={({ pressed }) => [styles.dialogConfirm, (!renameValue.trim() || renameRoom.isPending) && { opacity: 0.4 }, pressed && { opacity: 0.8 }]}
              >
                <Text style={styles.dialogConfirmText}>{renameRoom.isPending ? "저장 중..." : "저장"}</Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
  headerTitleBtn: { flexDirection: "row", alignItems: "center", gap: 5 },
  headerTitle: { fontSize: 17, fontWeight: "700", color: "#191f28" },
  headerAction: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },

  scroll: { paddingHorizontal: 16, paddingTop: 8 },
  sectionLabel: {
    fontSize: 10, fontWeight: "700", color: "#8b95a1", textTransform: "uppercase",
    letterSpacing: 1.5, marginBottom: 8, marginLeft: 4,
  },
  card: {
    backgroundColor: "#fff", borderRadius: 16, borderWidth: 1, borderColor: "#f2f4f6",
    overflow: "hidden", marginBottom: 20,
  },
  empty: { textAlign: "center", color: "#adb5bd", fontSize: 14, paddingVertical: 20 },

  codeCard: {
    backgroundColor: "#fff", borderRadius: 16, borderWidth: 1, borderColor: "#f2f4f6",
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 18, paddingVertical: 16, marginBottom: 20, gap: 12,
  },
  codeInner: { flex: 1 },
  codeLabel: { fontSize: 11, fontWeight: "600", color: "#adb5bd", marginBottom: 4 },
  codeValue: { fontSize: 20, fontWeight: "800", color: "#191f28", letterSpacing: 3 },
  copyIconBox: {
    width: 34, height: 34, borderRadius: 10,
    backgroundColor: "#f2f4f6",
    alignItems: "center", justifyContent: "center",
  },

  divider: { height: StyleSheet.hairlineWidth, backgroundColor: "#e5e8eb", marginLeft: 68 },
  memberRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12, gap: 10 },
  avatar: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  avatarText: { fontSize: 16, fontWeight: "700", color: "#fff" },
  memberName: { flex: 1, fontSize: 15, fontWeight: "600", color: "#191f28" },
  badge: { backgroundColor: "#f2f4f6", borderRadius: 5, paddingHorizontal: 6, paddingVertical: 2 },
  badgeText: { fontSize: 11, fontWeight: "700", color: "#8b95a1" },
  ownerBadge: { backgroundColor: "#e8f3ff" },
  ownerBadgeText: { color: "#3182f6" },
  kickBtn: { width: 32, height: 32, alignItems: "center", justifyContent: "center" },

  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "center", paddingHorizontal: 28 },
  dialog: { backgroundColor: "#fff", borderRadius: 24, paddingHorizontal: 24, paddingTop: 28, paddingBottom: 20 },
  dialogTitle: { fontSize: 18, fontWeight: "700", color: "#191f28", marginBottom: 8 },
  dialogMessage: { fontSize: 14, color: "#8b95a1", marginBottom: 24, lineHeight: 20 },
  dialogBtnRow: { flexDirection: "row", gap: 10 },
  dialogCancel: { flex: 1, height: 48, borderRadius: 12, backgroundColor: "#f2f4f6", alignItems: "center", justifyContent: "center" },
  dialogCancelText: { fontSize: 15, fontWeight: "600", color: "#8b95a1" },
  dialogDanger: { flex: 1, height: 48, borderRadius: 12, backgroundColor: "#fff0f1", alignItems: "center", justifyContent: "center" },
  dialogDangerText: { fontSize: 15, fontWeight: "700", color: "#f04452" },
  renameInput: { height: 54, backgroundColor: "#f2f4f6", borderRadius: 14, paddingHorizontal: 18, fontSize: 16, color: "#191f28", marginBottom: 16 },
  dialogConfirm: { flex: 1, height: 48, borderRadius: 12, backgroundColor: "#3182f6", alignItems: "center", justifyContent: "center" },
  dialogConfirmText: { fontSize: 15, fontWeight: "700", color: "#fff" },
});
