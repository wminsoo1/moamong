import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  Modal,
  Alert,
  Switch,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Linking,
} from "react-native";
import * as Notifications from "expo-notifications";
import { SafeAreaView } from "react-native-safe-area-context";
import { useCurrentUser } from "@/src/features/user/queries/useCurrentUser";
import { useUpdateNickname } from "@/src/features/user/mutations/useUpdateNickname";
import { useToggleNotification } from "@/src/features/user/mutations/useToggleNotification";
import { useRegisterPushToken } from "@/src/features/user/mutations/useRegisterPushToken";
import { useLogout } from "@/src/features/user/mutations/useLogout";
import messaging from "@react-native-firebase/messaging";
import { useQueryClient } from "@tanstack/react-query";
import { apiClient, clearSessionId } from "@/src/lib/api";
import { router } from "expo-router";
import {
  Bell,
  ChevronRight,
  LogOut,
  LayoutGrid,
  ListTodo,
  Repeat,
  BookOpen,
  UserX,
} from "lucide-react-native";

// ── Constants ────────────────────────────────────────────────────────────────

const CATEGORY_COLORS = [
  "#F97316", "#EF4444", "#E11D48", "#EC4899",
  "#8B5CF6", "#6366F1", "#3B82F6", "#0EA5E9",
  "#10B981", "#16A34A", "#EAB308", "#F59E0B",
  "#6B7280",
];

const today = new Date();
const { width: SCREEN_WIDTH } = Dimensions.get("window");

// ── Types ─────────────────────────────────────────────────────────────────────

interface Me {
  id: number;
  nickname: string;
  username: string;
  notificationsEnabled: boolean;
}

interface UserCategory {
  id: number;
  name: string;
  emoji: string;
  color: string;
  type: string;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function MyScreen() {
  const [isNicknameDialogOpen, setIsNicknameDialogOpen] = useState(false);
  const [usernameInput, setUsernameInput] = useState("");
  const [usernameError, setUsernameError] = useState("");

  const { user: me, isLoading } = useCurrentUser();

  const updateNickname = useUpdateNickname();
  const toggleNotification = useToggleNotification();
  const registerPushToken = useRegisterPushToken();
  const { logout } = useLogout();
  const queryClient = useQueryClient();

  const handleNotificationToggle = async (enabled: boolean) => {
    if (enabled) {
      const { status } = await Notifications.getPermissionsAsync();
      if (status === "denied") {
        Alert.alert(
          "알림 권한 필요",
          "알림을 받으려면 설정에서 알림을 허용해주세요.",
          [
            { text: "취소", style: "cancel" },
            { text: "설정 열기", onPress: () => Linking.openSettings() },
          ]
        );
        return;
      }
      if (status === "undetermined") {
        const { status: newStatus } = await Notifications.requestPermissionsAsync();
        if (newStatus !== "granted") return;
      }
    }
    toggleNotification.mutate(enabled, {
      onSuccess: async () => {
        if (enabled) {
          try {
            const token = await messaging().getToken();
            registerPushToken.mutate(token);
          } catch (e) {
            console.warn("[FCM] 토큰 재등록 실패", e);
          }
        }
      },
    });
  };

  const openNicknameDialog = () => {
    if (!me) return;
    setUsernameInput(me.username);
    setUsernameError("");
    setIsNicknameDialogOpen(true);
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  if (isLoading || !me) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>불러오는 중...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.pageTitle}>마이페이지</Text>

        {/* Profile */}
        <View style={styles.profileRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{me.nickname.charAt(0)}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileNickname}>{me.nickname}</Text>
            <Text style={styles.profileUsername}>@{me.username}</Text>
          </View>
          <Pressable
            onPress={openNicknameDialog}
            style={({ pressed }) => [
              styles.editProfileBtn,
              pressed && { opacity: 0.7 },
            ]}
          >
            <Text style={styles.editProfileText}>프로필 수정</Text>
          </Pressable>
        </View>

        {/* Section: 설정 */}
        <Text style={styles.sectionLabel}>설정</Text>
        <View style={styles.card}>
          {/* 분류 수정 */}
          <Pressable
            onPress={() => router.push("/category-group-management")}
            style={({ pressed }) => [
              styles.menuRow,
              pressed && { backgroundColor: "#f9fafb" },
            ]}
          >
            <LayoutGrid size={20} color="#4e5968" />
            <Text style={styles.menuText}>카테고리 수정</Text>
            <ChevronRight size={20} color="#adb5bd" />
          </Pressable>

          <View style={styles.menuDivider} />

          <Pressable
            onPress={() => router.push("/category-management")}
            style={({ pressed }) => [
              styles.menuRow,
              pressed && { backgroundColor: "#f9fafb" },
            ]}
          >
            <ListTodo size={20} color="#4e5968" />
            <Text style={styles.menuText}>세부 항목</Text>
            <ChevronRight size={20} color="#adb5bd" />
          </Pressable>

          <View style={styles.menuDivider} />

          <Pressable
            onPress={() => router.push("/recurring-spendings")}
            style={({ pressed }) => [
              styles.menuRow,
              pressed && { backgroundColor: "#f9fafb" },
            ]}
          >
            <Repeat size={20} color="#4e5968" />
            <Text style={styles.menuText}>정기 지출</Text>
            <ChevronRight size={20} color="#adb5bd" />
          </Pressable>

          <View style={styles.menuDivider} />

          <Pressable
            onPress={() => router.push("/account-share-settings")}
            style={({ pressed }) => [
              styles.menuRow,
              pressed && { backgroundColor: "#f9fafb" },
            ]}
          >
            <BookOpen size={20} color="#4e5968" />
            <Text style={styles.menuText}>가계부 공개 범위</Text>
            <ChevronRight size={20} color="#adb5bd" />
          </Pressable>

          <View style={styles.menuDivider} />

          {/* 알림 토글 */}
          <View style={styles.menuRow}>
            <Bell size={20} color="#4e5968" />
            <View style={{ flex: 1 }}>
              <Text style={styles.menuText}>알림 수신</Text>
              <Text style={styles.menuSubText}>방 사람들이 가계부를 작성하면 알림이 와요</Text>
            </View>
            <Switch
              value={me.notificationEnabled}
              onValueChange={handleNotificationToggle}
              disabled={toggleNotification.isPending}
              trackColor={{ false: "#e5e8eb", true: "#3182f6" }}
              thumbColor="#fff"
            />
          </View>
        </View>

        {/* Section: 계정 */}
        <Text style={styles.sectionLabel}>계정</Text>
        <View style={styles.card}>
          <Pressable
            onPress={() =>
              Alert.alert("로그아웃", "로그아웃 하시겠어요?", [
                { text: "취소", style: "cancel" },
                { text: "로그아웃", style: "destructive", onPress: logout },
              ])
            }
            style={({ pressed }) => [styles.menuRow, pressed && { backgroundColor: "#f9fafb" }]}
          >
            <LogOut size={20} color="#f04452" />
            <Text style={[styles.menuText, { color: "#f04452" }]}>로그아웃</Text>
          </Pressable>
          <View style={styles.menuDivider} />
          <Pressable
            onPress={() =>
              Alert.alert("회원 탈퇴", "탈퇴하면 모든 데이터가 삭제되며 복구할 수 없어요. 정말 탈퇴하시겠어요?", [
                { text: "취소", style: "cancel" },
                {
                  text: "탈퇴",
                  style: "destructive",
                  onPress: async () => {
                    try {
                      await apiClient("/api/users/me", { method: "DELETE" });
                    } finally {
                      await clearSessionId();
                      queryClient.clear();
                      router.replace("/(auth)/login");
                    }
                  },
                },
              ])
            }
            style={({ pressed }) => [styles.menuRow, pressed && { backgroundColor: "#f9fafb" }]}
          >
            <UserX size={20} color="#adb5bd" />
            <Text style={[styles.menuText, { color: "#adb5bd" }]}>회원 탈퇴</Text>
          </Pressable>
        </View>

        <View style={{ height: 80 }} />
      </ScrollView>

      {/* Nickname edit dialog */}
      <Modal
        visible={isNicknameDialogOpen}
        transparent
        animationType="none"
        onRequestClose={() => setIsNicknameDialogOpen(false)}
      >
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.dialogOverlay} keyboardVerticalOffset={100}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setIsNicknameDialogOpen(false)} />
          <Pressable style={styles.dialogBox} onPress={() => {}}>
            <Text style={styles.dialogTitle}>프로필 수정</Text>
            <Text style={styles.dialogSub}>한글, 영문, 숫자, 언더스코어 2~20자</Text>
            <Text style={styles.dialogInputLabel}>Username</Text>
            <TextInput
              style={styles.dialogInput}
              value={usernameInput}
              onChangeText={(t) => {
                setUsernameInput(t);
                setUsernameError("");
              }}
              placeholder="변경할 username 입력"
              placeholderTextColor="#c9cdd2"
              maxLength={20}
              autoCapitalize="none"
              autoCorrect={false}
              autoFocus
            />
            {usernameError ? (
              <Text style={styles.errorText}>{usernameError}</Text>
            ) : null}
            <View style={styles.dialogBtnRow}>
              <Pressable
                onPress={() => setIsNicknameDialogOpen(false)}
                style={({ pressed }) => [
                  styles.dialogCancelBtn,
                  pressed && { opacity: 0.7 },
                ]}
              >
                <Text style={styles.dialogCancelText}>취소</Text>
              </Pressable>
              <Pressable
                disabled={
                  !usernameInput.trim() ||
                  usernameInput === me?.username ||
                  updateNickname.isPending
                }
                onPress={() => updateNickname.mutate(usernameInput.trim(), {
                  onSuccess: () => setIsNicknameDialogOpen(false),
                  onError: (e: Error) => setUsernameError(e.message),
                })}
                style={({ pressed }) => [
                  styles.dialogSaveBtn,
                  (!usernameInput.trim() || usernameInput === me?.username) &&
                    styles.btnDisabled,
                  pressed && { opacity: 0.8 },
                ]}
              >
                <Text style={styles.dialogSaveText}>
                  {updateNickname.isPending ? "저장 중..." : "저장"}
                </Text>
              </Pressable>
            </View>
          </Pressable>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f9fafb" },
  scroll: { flex: 1, paddingHorizontal: 20 },
  loadingContainer: { flex: 1, alignItems: "center", justifyContent: "center" },
  loadingText: { fontSize: 14, color: "#adb5bd" },

  pageTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#191f28",
    marginTop: 24,
    marginBottom: 24,
  },

  // Profile
  profileRow: {
    flexDirection: "row",
    alignItems: "center", gap: 12, marginBottom: 28,
  },
  avatar: {
    width: 48, height: 48, borderRadius: 14, backgroundColor: "#e8f3ff",
    alignItems: "center", justifyContent: "center",
  },
  avatarText: { fontSize: 20, fontWeight: "700", color: "#3182f6" },
  profileInfo: { flex: 1 },
  profileNickname: { fontSize: 16, fontWeight: "600", color: "#191f28" },
  profileUsername: { fontSize: 12, color: "#8b95a1", marginTop: 2 },
  editProfileBtn: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: "#e5e8eb",
  },
  editProfileText: { fontSize: 12, fontWeight: "500", color: "#8b95a1" },

  sectionLabel: {
    fontSize: 10, fontWeight: "700", color: "#8b95a1", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 8, marginLeft: 4,
  },

  card: {
    backgroundColor: "#fff", borderRadius: 16, borderWidth: 1, borderColor: "#f2f4f6", overflow: "hidden", marginBottom: 16,
  },
  menuRow: {
    flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingVertical: 14,
  },
  menuText: { flex: 1, fontSize: 14, fontWeight: "500", color: "#191f28" },
  menuSubText: { fontSize: 11, color: "#8b95a1", marginTop: 2 },
  menuDivider: { height: 1, backgroundColor: "#f2f4f6", marginHorizontal: 16 },

  modalHeader: {
    backgroundColor: "#ffffff", borderBottomWidth: 1, borderBottomColor: "#f2f4f6", justifyContent: "center",
  },
  modalHeaderBtn: { width: 40, height: 40, alignItems: "flex-start", justifyContent: "center" },
  modalHeaderTitle: { fontSize: 17, fontWeight: "700", color: "#191f28", textAlign: "center" },

  tabRow: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 12 },
  tabContainer: {
    flexDirection: "row", backgroundColor: "#fff", borderRadius: 16, padding: 4, borderWidth: 1, borderColor: "#f2f4f6",
  },
  tabBtn: { flex: 1, paddingVertical: 10, borderRadius: 12, alignItems: "center" },
  tabBtnActive: { backgroundColor: "#3182f6" },
  tabBtnText: { fontSize: 15, fontWeight: "700", color: "#adb5bd" },
  tabBtnTextActive: { color: "#fff" },

  catListScroll: { flex: 1, paddingHorizontal: 20 },
  emptyText: { textAlign: "center", color: "#b0b8c1", fontSize: 13, paddingVertical: 40 },
  catListCard: {
    backgroundColor: "#fff", borderRadius: 16, borderWidth: 1, borderColor: "#f2f4f6", overflow: "hidden", marginBottom: 20,
  },
  catItem: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingVertical: 14 },
  catItemDivider: { height: 1, backgroundColor: "#f2f4f6" },
  catItemIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  catItemName: { flex: 1, fontSize: 15, fontWeight: "600", color: "#191f28" },
  deleteCatBtn: { width: 32, height: 32, alignItems: "center", justifyContent: "center" },

  addCatBtn: { alignItems: "center", justifyContent: "center" },

  dialogOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end", padding: 16 },
  dialogBox: { width: "100%", backgroundColor: "#fff", borderRadius: 24, padding: 24 },
  dialogTitle: { fontSize: 18, fontWeight: "700", color: "#191f28", marginBottom: 4 },
  dialogSub: { fontSize: 12, color: "#8b95a1", marginBottom: 20 },
  dialogInputLabel: { fontSize: 11, fontWeight: "600", color: "#8b95a1", marginBottom: 8 },
  dialogInput: { height: 44, borderRadius: 12, borderWidth: 1, borderColor: "#e5e8eb", paddingHorizontal: 14, fontSize: 15, fontWeight: "500", color: "#191f28", marginBottom: 8 },
  dialogBtnRow: { flexDirection: "row", gap: 10, marginTop: 16 },
  dialogCancelBtn: { flex: 1, height: 44, borderRadius: 12, borderWidth: 1, borderColor: "#e5e8eb", alignItems: "center", justifyContent: "center" },
  dialogCancelText: { fontSize: 13, fontWeight: "600", color: "#8b95a1" },
  dialogSaveBtn: { flex: 1, height: 44, borderRadius: 12, backgroundColor: "#3182f6", alignItems: "center", justifyContent: "center" },
  dialogSaveText: { fontSize: 13, fontWeight: "600", color: "#fff" },
  errorText: { fontSize: 12, color: "#f04452", textAlign: "center", marginBottom: 8 },
  btnDisabled: { opacity: 0.3 },

});
