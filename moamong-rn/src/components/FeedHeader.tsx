import { View, Text, TextInput, ScrollView, Pressable, StyleSheet } from "react-native";
import { Search } from "lucide-react-native";
import { SYSTEM_CATEGORIES } from "@/src/features/feed/types";

interface Room {
  id: number;
  name: string;
  unreadCount: number;
  isSystem: boolean;
}

interface Props {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCategory: string | null;
  onSelectCategory: (cat: string | null) => void;
  selectedRoomId: number | null;
  onSelectRoom: (id: number | null) => void;
  rooms: Room[];
}

export function FeedHeader({ searchQuery, onSearchChange, selectedCategory, onSelectCategory, selectedRoomId, onSelectRoom, rooms }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Search size={16} color="#8b95a1" />
          <TextInput
            style={styles.searchInput}
            placeholder="상품 검색"
            placeholderTextColor="#adb5bd"
            value={searchQuery}
            onChangeText={onSearchChange}
          />
        </View>
      </View>

      {rooms.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.roomScroll}>
          {rooms.map((room) => {
            const showBadge = !room.isSystem && room.unreadCount > 0 && selectedRoomId !== room.id;
            return (
              <View key={room.id} style={styles.roomTabWrap}>
                <Pressable
                  onPress={() => onSelectRoom(room.id)}
                  style={[styles.roomTab, selectedRoomId === room.id && styles.roomTabActive]}
                >
                  <Text style={[styles.roomTabText, selectedRoomId === room.id && styles.roomTabTextActive]}>
                    {room.name}
                  </Text>
                </Pressable>
                {showBadge && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{room.unreadCount > 99 ? "99+" : room.unreadCount}</Text>
                  </View>
                )}
              </View>
            );
          })}
        </ScrollView>
      )}

      {rooms.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
          {[{ key: null, name: "전체" }, ...SYSTEM_CATEGORIES].map((cat) => {
            const isActive = selectedCategory === (cat.key as string | null);
            return (
              <Pressable key={cat.key ?? "all"} onPress={() => onSelectCategory(cat.key as string | null)} style={styles.categoryTab}>
                <Text style={[styles.categoryTabText, isActive && styles.categoryTabTextActive]}>{cat.name}</Text>
                {isActive && <View style={styles.categoryTabIndicator} />}
              </Pressable>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: "#ffffff", paddingTop: 8, borderBottomWidth: 8, borderBottomColor: "#f2f4f6" },
  searchContainer: { paddingHorizontal: 16, paddingVertical: 12 },
  searchBox: { flexDirection: "row", alignItems: "center", backgroundColor: "#f2f4f6", borderRadius: 12, paddingHorizontal: 12, height: 48, gap: 8 },
  searchInput: { flex: 1, fontSize: 16, fontWeight: "600", color: "#191f28" },
  roomScroll: { paddingHorizontal: 16, paddingTop: 6, paddingBottom: 14, gap: 8 },
  roomTabWrap: { position: "relative" },
  roomTab: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, backgroundColor: "#f2f4f6" },
  roomTabActive: { backgroundColor: "#3182f6" },
  roomTabText: { fontSize: 13, fontWeight: "600", color: "#8b95a1" },
  roomTabTextActive: { color: "#fff" },
  badge: {
    position: "absolute", top: -5, right: -5,
    minWidth: 16, height: 16, borderRadius: 8,
    backgroundColor: "#f04452",
    alignItems: "center", justifyContent: "center",
    paddingHorizontal: 3,
    borderWidth: 1.5, borderColor: "#fff",
  },
  badgeText: { fontSize: 9, fontWeight: "800", color: "#fff" },
  categoryScroll: { paddingHorizontal: 16, paddingBottom: 8 },
  categoryTab: { marginRight: 24, paddingVertical: 12, alignItems: "center", position: "relative" },
  categoryTabText: { fontSize: 16, fontWeight: "600", color: "#adb5bd" },
  categoryTabTextActive: { color: "#191f28", fontWeight: "800" },
  categoryTabIndicator: { position: "absolute", bottom: 0, left: 0, right: 0, height: 2, backgroundColor: "#191f28", borderRadius: 1 },
});
