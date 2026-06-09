import { View, Text, Pressable, ScrollView, StyleSheet, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { ChevronLeft, ChevronRight } from "lucide-react-native";
import { useRooms } from "@/src/features/room/queries/useRooms";
import { useRoomMembers, RoomMember } from "@/src/features/room/queries/useRoomMembers";
import { useCurrentUser } from "@/src/features/user/queries/useCurrentUser";

const COLORS = ["#5B5FC7", "#107C10", "#C43E1C", "#038387", "#8764B8", "#881798", "#004E8C"];
const getRoomColor = (id: number) => COLORS[id % COLORS.length];

function RoomSection({ roomId, roomName, myId }: { roomId: number; roomName: string; myId: number }) {
  const { data: members = [], isLoading } = useRoomMembers(roomId);
  const others = members.filter((m) => m.userId !== myId);

  if (isLoading) {
    return (
      <View style={styles.loadingRow}>
        <ActivityIndicator size="small" color="#adb5bd" />
      </View>
    );
  }

  if (others.length === 0) {
    return <Text style={styles.emptyMember}>아직 다른 멤버가 없어요</Text>;
  }

  return (
    <>
      {others.map((member, idx) => (
        <View key={member.userId}>
          {idx > 0 && <View style={styles.divider} />}
          <Pressable
            onPress={() => router.push({
              pathname: "/member-spending/[userId]",
              params: { userId: String(member.userId), nickname: member.username },
            })}
            style={({ pressed }) => [styles.memberRow, pressed && { backgroundColor: "#f8f9fa" }]}
          >
            <View style={[styles.avatar, { backgroundColor: getRoomColor(member.userId) }]}>
              <Text style={styles.avatarText}>{member.username.charAt(0)}</Text>
            </View>
            <Text style={styles.memberName}>{member.username}</Text>
            <ChevronRight size={16} color="#c9cdd2" strokeWidth={2} />
          </Pressable>
        </View>
      ))}
    </>
  );
}

export default function FriendAccountsScreen() {
  const { rooms, isLoading } = useRooms();
  const { user: me } = useCurrentUser();

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={({ pressed }) => [styles.headerBack, pressed && { opacity: 0.5 }]}>
          <ChevronLeft size={24} color="#191f28" />
        </Pressable>
        <Text style={styles.headerTitle}>친구 가계부 보기</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {isLoading || !me ? (
          <ActivityIndicator color="#adb5bd" style={{ paddingVertical: 60 }} />
        ) : rooms.filter((r) => !r.isSystem).length === 0 ? (
          <Text style={styles.empty}>참여 중인 방이 없어요</Text>
        ) : (
          rooms.filter((r) => !r.isSystem).map((room) => {
            const color = getRoomColor(room.id);
            return (
              <View key={room.id} style={styles.section}>
                <View style={styles.roomHeader}>
                  <View style={[styles.roomIcon, { backgroundColor: color }]}>
                    <Text style={styles.roomIconText}>{room.name.charAt(0)}</Text>
                  </View>
                  <Text style={styles.roomName}>{room.name}</Text>
                </View>
                <View style={styles.card}>
                  <RoomSection roomId={room.id} roomName={room.name} myId={me.id} />
                </View>
              </View>
            );
          })
        )}
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
  empty: { textAlign: "center", color: "#adb5bd", fontSize: 14, paddingVertical: 60 },

  section: { marginBottom: 20 },
  roomHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8, paddingLeft: 4 },
  roomIcon: { width: 22, height: 22, borderRadius: 6, alignItems: "center", justifyContent: "center" },
  roomIconText: { fontSize: 11, fontWeight: "700", color: "#fff" },
  roomName: { fontSize: 12, fontWeight: "700", color: "#4e5968" },

  card: { backgroundColor: "#fff", borderRadius: 16, overflow: "hidden", borderWidth: 1, borderColor: "#f2f4f6" },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: "#e5e8eb", marginLeft: 68 },
  memberRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 13, gap: 12 },
  avatar: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  avatarText: { fontSize: 16, fontWeight: "700", color: "#fff" },
  memberName: { flex: 1, fontSize: 15, fontWeight: "600", color: "#191f28" },

  loadingRow: { paddingVertical: 20, alignItems: "center" },
  emptyMember: { fontSize: 13, color: "#adb5bd", textAlign: "center", paddingVertical: 20 },
});
