import { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRooms } from "@/src/features/room/queries/useRooms";
import { useFeed } from "@/src/features/feed/queries/useFeed";
import { useComments } from "@/src/features/feed/queries/useComments";
import { useAddComment } from "@/src/features/feed/mutations/useAddComment";
import { useToggleReaction } from "@/src/features/feed/mutations/useToggleReaction";
import { useRecordView } from "@/src/features/feed/mutations/useRecordView";
import { FeedItem } from "@/src/features/feed/types";
import { Plus } from "lucide-react-native";
import { FeedHeader } from "@/src/components/FeedHeader";
import { FeedCard } from "@/src/components/FeedCard";
import { useRouter } from "expo-router";

export default function FeedScreen() {
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");
  const [imgErrors, setImgErrors] = useState<Set<number>>(new Set());
  const [openComments, setOpenComments] = useState<number | null>(null);
  const [commentText, setCommentText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);

  const { rooms } = useRooms();

  useEffect(() => {
    if (rooms.length > 0 && selectedRoomId === null) {
      const systemRoom = rooms.find((r) => r.isSystem);
      setSelectedRoomId(systemRoom ? systemRoom.id : rooms[0].id);
    }
  }, [rooms]);
  const { feedItems = [], fetchNextPage, hasNextPage, isFetchingNextPage } = useFeed(rooms, selectedRoomId);
  const { comments } = useComments(openComments, selectedRoomId);
  const addComment = useAddComment();
  const toggleReaction = useToggleReaction();
  const recordView = useRecordView();

  let filteredFeed = feedItems || [];
  if (selectedCategory) {
    filteredFeed = filteredFeed.filter((item) => item?.category === selectedCategory);
  }
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    filteredFeed = filteredFeed.filter((item) =>
      item?.title?.toLowerCase().includes(q) ||
      item?.review?.toLowerCase().includes(q) ||
      item?.senderUsername?.toLowerCase().includes(q)
    );
  }

  const renderItem = ({ item }: { item: FeedItem }) => {
    if (!item?.sharedItemId) return null;
    return (
    <FeedCard
      item={item}
      isOpen={openComments === item.sharedItemId}
      onToggle={() => {
        if (openComments === item.sharedItemId) {
          setOpenComments(null);
        } else {
          setOpenComments(item.sharedItemId);
          setCommentText("");
        }
      }}
      comments={comments}
      commentText={commentText}
      onCommentTextChange={setCommentText}
      imgErrors={imgErrors}
      onImgError={(id) => setImgErrors(p => new Set([...p, id]))}
      onToggleReaction={(id, emoji) => toggleReaction.mutate({ sharedItemId: id, emoji })}
      onAddComment={(id, content, onSuccess) => addComment.mutate({ sharedItemId: id, content, roomId: selectedRoomId ?? undefined }, { onSuccess })}
      isAddingComment={addComment.isPending}
      onPressItem={() => {
        if (item.url?.startsWith("http")) {
          recordView.mutate(item.sharedItemId);
          Linking.openURL(item.url).catch(() => {});
        }
      }}
    />
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <FeedHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        selectedRoomId={selectedRoomId}
        onSelectRoom={setSelectedRoomId}
        rooms={rooms}
      />

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <FlatList
          data={filteredFeed}
          keyExtractor={(item, index) => item?.sharedItemId ? String(item.sharedItemId) : `feed-${index}`}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          onEndReached={() => { if (hasNextPage && !isFetchingNextPage) fetchNextPage(); }}
          onEndReachedThreshold={0.3}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>공유된 핫템이 없어요</Text>
            </View>
          }
          ListFooterComponent={
            isFetchingNextPage ? <ActivityIndicator style={{ paddingVertical: 20 }} color="#3182f6" /> : null
          }
        />
      </KeyboardAvoidingView>

      <Pressable
        onPress={() => router.push("/share-item")}
        style={({ pressed }) => [styles.fab, pressed && { opacity: 0.8 }]}
      >
        <Plus size={20} color="#fff" strokeWidth={2.5} />
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#ffffff" },
  listContent: { paddingBottom: 100 },
  emptyContainer: { paddingVertical: 100, alignItems: "center" },
  emptyText: { color: "#adb5bd", fontSize: 14, fontWeight: "500" },
  fab: { position: "absolute", right: 20, bottom: 16, width: 44, height: 44, borderRadius: 22, backgroundColor: "#3182f6", alignItems: "center", justifyContent: "center" },
});
