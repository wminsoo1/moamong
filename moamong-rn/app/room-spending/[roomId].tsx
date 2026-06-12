import { useState, useMemo, useEffect } from "react";
import {
  View, Text, Pressable, ScrollView, RefreshControl, StyleSheet,
  Image, Modal, StatusBar, TextInput, Alert,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import {
  ChevronLeft, ChevronLeft as Prev, ChevronRight as Next,
  Camera, X, Settings, MessageCircle, Heart, ArrowUp, Trash2,
} from "lucide-react-native";
import { useRoomSpendings } from "@/src/features/spending/queries/useRoomSpendings";
import { useSpendingComments } from "@/src/features/spending/queries/useSpendingComments";
import { useAddComment } from "@/src/features/spending/mutations/useAddComment";
import { useDeleteComment } from "@/src/features/spending/mutations/useDeleteComment";
import { useToggleSpendingLike } from "@/src/features/spending/mutations/useToggleSpendingLike";
import { useMarkRoomRead } from "@/src/features/room/mutations/useMarkRoomRead";
import { useCurrentUser } from "@/src/features/user/queries/useCurrentUser";
import { useGroupSettings } from "@/src/features/user/hooks/useGroupSettings";
import { CategoryIcon } from "@/src/components/CategoryIcon";
import { format, parseISO, formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { RoomSpending, SpendingComment } from "@/src/features/spending/types";

const AVATAR_COLORS = ["#5B5FC7", "#107C10", "#C43E1C", "#038387", "#8764B8", "#881798", "#004E8C"];
const getAvatarColor = (userId: number) => AVATAR_COLORS[userId % AVATAR_COLORS.length];

function ImageViewer({ uri, onClose }: { uri: string; onClose: () => void }) {
  const insets = useSafeAreaInsets();
  return (
    <Modal visible animationType="fade" statusBarTranslucent onRequestClose={onClose}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <View style={iv.bg}>
        <Pressable onPress={onClose} style={[iv.closeBtn, { top: insets.top + 8 }]} hitSlop={12}>
          <X size={22} color="#fff" strokeWidth={2.5} />
        </Pressable>
        <Image source={{ uri }} style={iv.img} resizeMode="contain" />
      </View>
    </Modal>
  );
}

const iv = StyleSheet.create({
  bg: { flex: 1, backgroundColor: "#000", alignItems: "center", justifyContent: "center" },
  closeBtn: { position: "absolute", right: 16, width: 40, height: 40, alignItems: "center", justifyContent: "center", zIndex: 10 },
  img: { width: "100%", height: "80%" },
});

function InlineComments({
  spending, roomId, currentUserId, commentText, onCommentTextChange,
}: {
  spending: RoomSpending;
  roomId: number;
  currentUserId: number;
  commentText: string;
  onCommentTextChange: (text: string) => void;
}) {
  const { data: comments = [] } = useSpendingComments(roomId, spending.id);
  const addComment = useAddComment(roomId, spending.id);
  const deleteComment = useDeleteComment(spending.id, roomId);

  const handleSend = () => {
    const content = commentText.trim();
    if (!content || addComment.isPending) return;
    addComment.mutate(content, { onSuccess: () => onCommentTextChange("") });
  };

  const handleDelete = (comment: SpendingComment) => {
    Alert.alert("댓글 삭제", "댓글을 삭제할까요?", [
      { text: "취소", style: "cancel" },
      { text: "삭제", style: "destructive", onPress: () => deleteComment.mutate(comment.id) },
    ]);
  };

  return (
    <View style={cs.section}>
      <View style={cs.commentList}>
        {comments.length === 0 ? (
          <Text style={cs.empty}>첫 댓글을 남겨보세요</Text>
        ) : (
          comments.map((c) => (
            <View key={c.id} style={cs.commentItem}>
              <View style={[cs.avatar, { backgroundColor: getAvatarColor(c.userId) }]}>
                <Text style={cs.avatarText}>{c.username.charAt(0)}</Text>
              </View>
              <View style={cs.commentContent}>
                <View style={cs.commentHeader}>
                  <Text style={cs.commentUsername}>{c.username}</Text>
                  <Text style={cs.commentTime}>
                    {formatDistanceToNow(parseISO(c.createdAt), { addSuffix: true, locale: ko })}
                  </Text>
                  {c.userId === currentUserId && (
                    <Pressable
                      onPress={() => handleDelete(c)}
                      hitSlop={8}
                      style={({ pressed }) => [{ marginLeft: "auto" }, pressed && { opacity: 0.5 }]}
                    >
                      <Trash2 size={12} color="#c9cdd2" strokeWidth={2} />
                    </Pressable>
                  )}
                </View>
                <Text style={cs.commentBody}>{c.content}</Text>
              </View>
            </View>
          ))
        )}
      </View>
      <View style={cs.inputRow}>
        <TextInput
          style={cs.input}
          placeholder="댓글을 남겨보세요..."
          placeholderTextColor="#adb5bd"
          value={commentText}
          onChangeText={onCommentTextChange}
          returnKeyType="send"
          onSubmitEditing={handleSend}
          maxLength={200}
        />
        <Pressable
          disabled={!commentText.trim() || addComment.isPending}
          onPress={handleSend}
          style={[cs.sendBtn, commentText.trim() && cs.sendBtnActive]}
        >
          <ArrowUp size={16} color={commentText.trim() ? "#fff" : "#adb5bd"} strokeWidth={3} />
        </Pressable>
      </View>
    </View>
  );
}

export default function RoomSpendingScreen() {
  const { roomId, name, inviteCode, createdBy } = useLocalSearchParams<{
    roomId: string; name: string; inviteCode: string; createdBy: string;
  }>();
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [viewingImage, setViewingImage] = useState<string | null>(null);
  const [openCommentId, setOpenCommentId] = useState<number | null>(null);
  const [commentText, setCommentText] = useState("");
  const [commentCountOverrides, setCommentCountOverrides] = useState<Record<number, number>>({});
  const [manualRefreshing, setManualRefreshing] = useState(false);

  const numericRoomId = Number(roomId);
  const { data: spendings = [], isLoading, refetch } = useRoomSpendings(numericRoomId, year, month);
  const { data: openComments = [] } = useSpendingComments(numericRoomId, openCommentId);
  const toggleLike = useToggleSpendingLike(numericRoomId, year, month);
  const markRead = useMarkRoomRead();
  const { user: me } = useCurrentUser();
  const { getColor, getIcon } = useGroupSettings();

  useEffect(() => { markRead.mutate(numericRoomId); }, [roomId]);

  useEffect(() => {
    if (openCommentId == null) return;
    setCommentCountOverrides(prev => ({ ...prev, [openCommentId]: openComments.length }));
  }, [openCommentId, openComments]);

  const grouped = useMemo(() => {
    const map = new Map<string, RoomSpending[]>();
    for (const s of spendings) {
      if (!map.has(s.date)) map.set(s.date, []);
      map.get(s.date)!.push(s);
    }
    return Array.from(map.entries()).sort((a, b) => b[0].localeCompare(a[0]));
  }, [spendings]);

  const prevMonth = () => {
    if (month === 1) { setYear(y => y - 1); setMonth(12); }
    else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (month === 12) { setYear(y => y + 1); setMonth(1); }
    else setMonth(m => m + 1);
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      {viewingImage && <ImageViewer uri={viewingImage} onClose={() => setViewingImage(null)} />}

      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={({ pressed }) => [styles.headerBack, pressed && { opacity: 0.5 }]}>
          <ChevronLeft size={24} color="#191f28" />
        </Pressable>
        <Text style={styles.headerTitle}>{name} 가계부</Text>
        <Pressable
          onPress={() => router.push({ pathname: "/room-spending-settings/[roomId]", params: { roomId, name, inviteCode, createdBy } })}
          style={({ pressed }) => [styles.headerBack, pressed && { opacity: 0.5 }]}
        >
          <Settings size={20} color="#4e5968" />
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
        refreshControl={<RefreshControl refreshing={manualRefreshing} onRefresh={async () => { setManualRefreshing(true); await refetch(); setManualRefreshing(false); }} />}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.monthRow}>
          <Pressable onPress={prevMonth} style={({ pressed }) => [styles.monthBtn, pressed && { opacity: 0.5 }]}>
            <Prev size={20} color="#8b95a1" />
          </Pressable>
          <Text style={styles.monthText}>{year}년 {month}월</Text>
          <Pressable onPress={nextMonth} style={({ pressed }) => [styles.monthBtn, pressed && { opacity: 0.5 }]}>
            <Next size={20} color="#8b95a1" />
          </Pressable>
        </View>
        {isLoading ? (
          <Text style={styles.empty}>불러오는 중...</Text>
        ) : grouped.length === 0 ? (
          <Text style={styles.empty}>공개된 지출이 없어요</Text>
        ) : (
          grouped.map(([date, items]) => (
            <View key={date} style={styles.dateGroup}>
              <Text style={styles.dateLabel}>
                {format(parseISO(date), "M월 d일 (EEEEE)", { locale: ko })}
              </Text>
              {items.map((item) => {
                const color = getColor(item.categoryGroup);
                const isOpen = openCommentId === item.id;
                const displayCount = commentCountOverrides[item.id] ?? item.commentCount;
                return (
                  <View key={item.id} style={styles.card}>
                    <View style={styles.row}>
                      <View style={{ position: "relative" }}>
                        <View style={[styles.iconBox, { backgroundColor: color }]}>
                          <CategoryIcon emoji={getIcon(item.categoryGroup)} color="#fff" isWhite size={16} />
                        </View>
                        {item.imageUrl && (
                          <View style={styles.imageBadge}>
                            <Camera size={8} color="#fff" strokeWidth={2.5} />
                          </View>
                        )}
                      </View>
                      <View style={{ flex: 1 }}>
                        <View style={styles.nameRow}>
                          <Text style={styles.categoryName} numberOfLines={1}>{item.memo || item.categoryName}</Text>
                          {item.createdAt && (
                            <Text style={styles.itemTime}>
                              {format(parseISO(item.createdAt), "a h:mm", { locale: ko })}
                            </Text>
                          )}
                        </View>
                        <View style={styles.metaRow}>
                          <View style={[styles.avatarDot, { backgroundColor: getAvatarColor(item.userId) }]}>
                            <Text style={styles.avatarDotText}>{item.username.charAt(0)}</Text>
                          </View>
                          <Text style={styles.username}>{item.username}</Text>
                          {item.memo && (
                            <Text style={styles.metaSep} numberOfLines={1}>· {item.categoryName}</Text>
                          )}
                        </View>
                      </View>
                      <View style={styles.amountCol}>
                        <Text style={styles.amount}>-{item.amount.toLocaleString()}원</Text>
                        <View style={styles.cardActions}>
                          <Pressable
                            onPress={() => toggleLike.mutate(item.id)}
                            hitSlop={12}
                            style={styles.actionBtn}
                          >
                            <Heart
                              size={16}
                              color={item.liked ? "#f04452" : "#c9cdd2"}
                              fill={item.liked ? "#f04452" : "transparent"}
                              strokeWidth={1.8}
                            />
                            {item.likeCount > 0 && (
                              <Text style={[styles.actionBtnText, item.liked && { color: "#f04452" }]}>
                                {item.likeCount}
                              </Text>
                            )}
                          </Pressable>
                          <Pressable
                            onPress={() => {
                              if (isOpen) {
                                setOpenCommentId(null);
                              } else {
                                setOpenCommentId(item.id);
                                setCommentText("");
                              }
                            }}
                            hitSlop={12}
                            style={styles.actionBtn}
                          >
                            <MessageCircle
                              size={16}
                              color={isOpen ? "#3182f6" : "#c9cdd2"}
                              fill={isOpen ? "#dbeafe" : "transparent"}
                              strokeWidth={1.8}
                            />
                            {displayCount > 0 && (
                              <Text style={[styles.actionBtnText, isOpen && { color: "#3182f6" }]}>
                                {displayCount}
                              </Text>
                            )}
                          </Pressable>
                        </View>
                      </View>
                    </View>

                    {item.imageUrl && (
                      <Pressable onPress={() => setViewingImage(item.imageUrl!)} style={({ pressed }) => [pressed && { opacity: 0.85 }]}>
                        <Image source={{ uri: item.imageUrl }} style={styles.image} resizeMode="cover" />
                      </Pressable>
                    )}

                    {isOpen && me && (
                      <InlineComments
                        spending={item}
                        roomId={numericRoomId}
                        currentUserId={me.id}
                        commentText={commentText}
                        onCommentTextChange={setCommentText}
                      />
                    )}
                  </View>
                );
              })}
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f2f4f6" },
  header: {
    height: 56, flexDirection: "row", alignItems: "center",
    justifyContent: "space-between", paddingHorizontal: 8, backgroundColor: "#f2f4f6",
  },
  headerBack: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 17, fontWeight: "700", color: "#191f28" },
  monthRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 16, paddingVertical: 8, marginBottom: 8 },
  monthBtn: { padding: 8 },
  monthText: { fontSize: 16, fontWeight: "700", color: "#191f28", minWidth: 100, textAlign: "center" },
  empty: { textAlign: "center", color: "#adb5bd", fontSize: 14, paddingVertical: 60 },
  dateGroup: { marginBottom: 12 },
  dateLabel: { fontSize: 12, fontWeight: "700", color: "#8b95a1", marginBottom: 6, marginLeft: 4 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    marginBottom: 6,
    overflow: "hidden",
  },
  row: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12, gap: 10 },
  iconBox: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  imageBadge: {
    position: "absolute", bottom: -2, right: -2,
    width: 15, height: 15, borderRadius: 8,
    backgroundColor: "#3182f6", borderWidth: 1.5, borderColor: "#fff",
    alignItems: "center", justifyContent: "center",
  },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  categoryName: { fontSize: 14, fontWeight: "600", color: "#191f28", flexShrink: 1 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 },
  avatarDot: { width: 14, height: 14, borderRadius: 7, alignItems: "center", justifyContent: "center" },
  avatarDotText: { fontSize: 8, fontWeight: "700", color: "#fff" },
  username: { fontSize: 11, color: "#8b95a1", fontWeight: "500" },
  metaSep: { fontSize: 11, color: "#adb5bd", flex: 1 },
  amountCol: { alignItems: "flex-end", gap: 4 },
  amount: { fontSize: 14, fontWeight: "700", color: "#191f28" },
  itemTime: { fontSize: 11, color: "#adb5bd" },
  image: { width: "100%", height: 180 },
  cardActions: { flexDirection: "row", alignItems: "center", gap: 8 },
  actionBtn: { flexDirection: "row", alignItems: "center", gap: 2 },
  actionBtnText: { fontSize: 11, fontWeight: "700", color: "#c9cdd2" },
});

const cs = StyleSheet.create({
  section: { backgroundColor: "#f8f9fa", borderTopWidth: 1, borderTopColor: "#f2f4f6" },
  commentList: { paddingVertical: 12 },
  empty: { paddingVertical: 20, textAlign: "center", fontSize: 13, color: "#adb5bd", fontWeight: "500" },
  commentItem: { flexDirection: "row", gap: 10, paddingHorizontal: 16, paddingVertical: 8, alignItems: "flex-start" },
  avatar: { width: 24, height: 24, borderRadius: 8, alignItems: "center", justifyContent: "center", marginTop: 2 },
  avatarText: { color: "#fff", fontSize: 10, fontWeight: "800" },
  commentContent: { flex: 1, gap: 2 },
  commentHeader: { flexDirection: "row", alignItems: "center", gap: 6 },
  commentUsername: { fontSize: 13, fontWeight: "700", color: "#191f28" },
  commentTime: { fontSize: 11, color: "#adb5bd" },
  commentBody: { fontSize: 14, color: "#4e5968", lineHeight: 20 },
  inputRow: {
    flexDirection: "row", alignItems: "center", gap: 10,
    paddingHorizontal: 12, paddingVertical: 10,
    backgroundColor: "#fff", borderTopWidth: 1, borderTopColor: "#f2f4f6",
  },
  input: {
    flex: 1, height: 38, backgroundColor: "#f2f4f6", borderRadius: 12,
    paddingHorizontal: 14, fontSize: 14, color: "#191f28",
  },
  sendBtn: { width: 34, height: 34, borderRadius: 10, backgroundColor: "#e5e8eb", alignItems: "center", justifyContent: "center" },
  sendBtnActive: { backgroundColor: "#3182f6" },
});
