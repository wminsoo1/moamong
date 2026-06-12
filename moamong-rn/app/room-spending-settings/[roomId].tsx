import { useState } from "react";
import { View, Text, Pressable, ScrollView, StyleSheet, Alert, Switch } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { ChevronLeft, Copy, RefreshCw } from "lucide-react-native";
import * as Clipboard from "expo-clipboard";
import { toast } from "@/src/lib/toast";
import { useCurrentUser } from "@/src/features/user/queries/useCurrentUser";
import { useRegenerateInviteCode } from "@/src/features/room/mutations/useRegenerateInviteCode";
import { useRoomNotification, useToggleRoomNotification } from "@/src/features/room/queries/useRoomNotification";

export default function RoomSpendingSettingsScreen() {
  const { roomId, name, inviteCode, createdBy } = useLocalSearchParams<{
    roomId: string; name: string; inviteCode: string; createdBy: string;
  }>();
  const rid = Number(roomId);
  const { user: me } = useCurrentUser();
  const isOwner = me?.id === Number(createdBy);

  const [currentCode, setCurrentCode] = useState(inviteCode);
  const regenerateCode = useRegenerateInviteCode();
  const { data: notificationEnabled = true } = useRoomNotification(rid);
  const toggleNotification = useToggleRoomNotification(rid);

  const handleCopy = async () => {
    await Clipboard.setStringAsync(currentCode);
    toast.show("초대 코드가 복사됐어요");
  };

  const handleRegenerate = () => {
    Alert.alert("초대 코드 재생성", "기존 코드는 사용할 수 없게 돼요. 재생성할까요?", [
      { text: "취소", style: "cancel" },
      {
        text: "재생성",
        onPress: () => regenerateCode.mutate(rid, {
          onSuccess: (data) => { setCurrentCode(data.inviteCode); toast.show("초대 코드가 재생성됐어요"); },
        }),
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={({ pressed }) => [styles.headerBack, pressed && { opacity: 0.5 }]}>
          <ChevronLeft size={24} color="#191f28" />
        </Pressable>
        <Text style={styles.headerTitle}>{name} 설정</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* 초대 코드 */}
        <Text style={styles.sectionLabel}>초대 코드</Text>
        <Pressable onPress={handleCopy} style={({ pressed }) => [styles.codeCard, pressed && { opacity: 0.7 }]}>
          <View style={styles.codeInner}>
            <Text style={styles.codeLabel}>탭하여 복사</Text>
            <Text style={styles.codeValue}>{currentCode}</Text>
          </View>
          <View style={styles.iconBtn}>
            <Copy size={15} color="#8b95a1" strokeWidth={2} />
          </View>
          {isOwner && (
            <Pressable
              onPress={handleRegenerate}
              style={({ pressed }) => [styles.iconBtn, { marginLeft: 8 }, pressed && { opacity: 0.6 }]}
            >
              <RefreshCw size={15} color="#8b95a1" strokeWidth={2} />
            </Pressable>
          )}
        </Pressable>

        {/* 알림 설정 */}
        <Text style={styles.sectionLabel}>알림</Text>
        <View style={styles.settingCard}>
          <Text style={styles.settingLabel}>지출 공유 알림</Text>
          <Switch
            value={notificationEnabled}
            onValueChange={() => toggleNotification.mutate()}
            trackColor={{ false: "#e5e8eb", true: "#3182f6" }}
            thumbColor="#fff"
          />
        </View>

        <View style={{ height: 60 }} />
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
  scroll: { paddingHorizontal: 16, paddingTop: 8 },
  sectionLabel: {
    fontSize: 10, fontWeight: "700", color: "#8b95a1", textTransform: "uppercase",
    letterSpacing: 1.5, marginBottom: 8, marginLeft: 4,
  },
  codeCard: {
    backgroundColor: "#fff", borderRadius: 16, borderWidth: 1, borderColor: "#f2f4f6",
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 18, paddingVertical: 16, marginBottom: 24, gap: 12,
  },
  codeInner: { flex: 1 },
  codeLabel: { fontSize: 11, fontWeight: "600", color: "#adb5bd", marginBottom: 4 },
  codeValue: { fontSize: 20, fontWeight: "800", color: "#191f28", letterSpacing: 3 },
  iconBtn: {
    width: 34, height: 34, borderRadius: 10,
    backgroundColor: "#f2f4f6", alignItems: "center", justifyContent: "center",
  },
  settingCard: {
    backgroundColor: "#fff", borderRadius: 16, borderWidth: 1, borderColor: "#f2f4f6",
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 18, paddingVertical: 14, marginBottom: 24,
  },
  settingLabel: { fontSize: 15, fontWeight: "500", color: "#191f28" },
});
