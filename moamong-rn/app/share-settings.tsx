import { View, Text, Pressable, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { ChevronLeft, Users } from "lucide-react-native";
import { useRooms } from "@/src/features/room/queries/useRooms";
import { useShareSettings } from "@/src/features/user/queries/useShareSettings";
import { useUpdateShareSettings } from "@/src/features/user/mutations/useUpdateShareSettings";

export default function ShareSettingsScreen() {
  const { rooms } = useRooms();
  const { data: shareSettings } = useShareSettings();
  const updateShareSettings = useUpdateShareSettings();

  const roomIds = shareSettings?.roomIds ?? [];

  const toggleRoom = (roomId: number) => {
    const next = roomIds.includes(roomId)
      ? roomIds.filter((id) => id !== roomId)
      : [...roomIds, roomId];
    updateShareSettings.mutate(next);
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [styles.headerBack, pressed && { opacity: 0.5 }]}
        >
          <ChevronLeft size={24} color="#191f28" />
        </Pressable>
        <Text style={styles.headerTitle}>피드 공유 설정</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 60 }}>

        {/* 방 선택 */}
        {rooms.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>공유할 방</Text>
            <View style={styles.card}>
              {rooms.map((room, index) => {
                const checked = roomIds.includes(room.id);
                return (
                  <View key={room.id}>
                    {index > 0 && <View style={styles.divider} />}
                    <Pressable
                      onPress={() => toggleRoom(room.id)}
                      style={({ pressed }) => [
                        styles.row,
                        pressed && { backgroundColor: "#f9fafb" },
                      ]}
                    >
                      <View style={[styles.iconBox, { backgroundColor: checked ? "#e8f3ff" : "#f2f4f6" }]}>
                        <Users size={17} color={checked ? "#3182f6" : "#adb5bd"} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.rowLabel}>{room.name}</Text>
                        {room.isSystem && (
                          <Text style={styles.rowSub}>모두가 볼 수 있는 기본 방</Text>
                        )}
                      </View>
                      <View style={[styles.checkCircle, checked && styles.checkCircleOn]}>
                        {checked && <Text style={styles.checkMark}>✓</Text>}
                      </View>
                    </Pressable>
                  </View>
                );
              })}
            </View>
            <Text style={styles.footer}>
              공유 시 선택한 방에 자동으로 올라가요.
            </Text>
          </>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f9fafb" },

  header: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    backgroundColor: "#f9fafb",
  },
  headerBack: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 17, fontWeight: "700", color: "#191f28" },

  scroll: { paddingHorizontal: 20, paddingTop: 8 },

  sectionLabel: {
    fontSize: 12, fontWeight: "700", color: "#8b95a1",
    marginBottom: 8, marginLeft: 4,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#f2f4f6",
    overflow: "hidden",
  },

  divider: { height: 1, backgroundColor: "#f2f4f6", marginLeft: 68 },

  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
    minHeight: 64,
  },

  iconBox: {
    width: 36, height: 36, borderRadius: 10,
    alignItems: "center", justifyContent: "center",
  },

  rowLabel: { fontSize: 15, fontWeight: "600", color: "#191f28" },
  rowSub: { fontSize: 12, color: "#8b95a1", marginTop: 2 },

  checkCircle: {
    width: 22, height: 22, borderRadius: 11,
    borderWidth: 1.5, borderColor: "#d1d6db",
    alignItems: "center", justifyContent: "center",
  },
  checkCircleOn: { backgroundColor: "#3182f6", borderColor: "#3182f6" },
  checkMark: { color: "#fff", fontSize: 12, fontWeight: "700" },

  footer: {
    fontSize: 12, color: "#adb5bd",
    marginTop: 8, marginLeft: 4,
  },
});
