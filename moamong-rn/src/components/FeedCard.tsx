import { View, Text, TextInput, Pressable, Image, StyleSheet, Alert } from "react-native";
import { Heart, MessageCircle, ArrowUp, Eye, Trash2, Pencil } from "lucide-react-native";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { CategoryIcon } from "@/src/components/CategoryIcon";
import { SYSTEM_CATEGORIES } from "@/src/features/feed/types";
import type { FeedItem, FeedComment } from "@/src/features/feed/types";

function getCategoryByKey(key: string) {
  return SYSTEM_CATEGORIES.find((c) => c.key === key) ?? SYSTEM_CATEGORIES[SYSTEM_CATEGORIES.length - 1];
}

const AVATAR_COLORS = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#DDA0DD", "#F0883A", "#3182f6", "#10B981"];

function getAvatarColor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

interface Props {
  item: FeedItem;
  isOpen: boolean;
  onToggle: () => void;
  comments: FeedComment[];
  commentText: string;
  onCommentTextChange: (text: string) => void;
  imgErrors: Set<number>;
  onImgError: (id: number) => void;
  onToggleReaction: (sharedItemId: number, emoji: string) => void;
  onAddComment: (sharedItemId: number, content: string, onSuccess: () => void) => void;
  isAddingComment: boolean;
  onPressItem: () => void;
  myId?: number;
  onDelete?: (sharedItemId: number) => void;
  onEdit?: (item: FeedItem) => void;
  onDeleteComment?: (commentId: number) => void;
}

export function FeedCard({
  item, isOpen, onToggle,
  comments, commentText, onCommentTextChange,
  imgErrors, onImgError,
  onToggleReaction, onAddComment, isAddingComment,
  onPressItem, myId, onDelete, onEdit, onDeleteComment,
}: Props) {
  const cat = getCategoryByKey(item.category);
  const hasImage = !!item.imageUrl && !imgErrors.has(item.sharedItemId);
  const heartReaction = item.reactions.find(r => r.emoji === "❤️");

  return (
    <View style={styles.feedCard}>
      <View style={styles.feedCardBody}>
        <Pressable
          onPress={onPressItem}
          style={({ pressed }) => [styles.feedImageContainer, { backgroundColor: hasImage ? "#f2f4f6" : cat.color + "18" }, pressed && { opacity: 0.8 }]}
        >
          {hasImage ? (
            <Image source={{ uri: item.imageUrl! }} style={styles.feedImage} onError={() => onImgError(item.sharedItemId)} />
          ) : (
            <CategoryIcon emoji={cat.emoji} color={cat.color} size={28} />
          )}
        </Pressable>

        <View style={styles.feedMainContent}>
          <Pressable
            onPress={onPressItem}
            style={({ pressed }) => [styles.feedInfo, pressed && { opacity: 0.7 }]}
          >
            <View style={styles.feedMeta}>
              <View style={[styles.feedCatBadge, { backgroundColor: cat.color + "12" }]}>
                <Text style={[styles.feedCatBadgeText, { color: cat.color }]}>{cat.name}</Text>
              </View>
              <View style={styles.viewCountBadge}>
                <Eye size={10} color="#adb5bd" strokeWidth={1.8} />
                <Text style={styles.viewCountText}>{item.viewCount}</Text>
              </View>
              <Text style={styles.feedSender} numberOfLines={1}>{item.senderUsername}</Text>
              <Text style={styles.feedTime}>{formatDistanceToNow(new Date(item.createdAt), { addSuffix: true, locale: ko })}</Text>
              {myId === item.userId && (
                <>
                  {onEdit && (
                    <Pressable
                      onPress={() => onEdit(item)}
                      hitSlop={8}
                      style={({ pressed }) => [styles.deleteBtn, pressed && { opacity: 0.5 }]}
                    >
                      <Pencil size={13} color="#adb5bd" strokeWidth={2} />
                    </Pressable>
                  )}
                  {onDelete && (
                    <Pressable
                      onPress={() =>
                        Alert.alert("핫템 삭제", "이 핫템을 삭제할까요?", [
                          { text: "취소", style: "cancel" },
                          { text: "삭제", style: "destructive", onPress: () => onDelete(item.sharedItemId) },
                        ])
                      }
                      hitSlop={8}
                      style={({ pressed }) => [styles.deleteBtn, pressed && { opacity: 0.5 }]}
                    >
                      <Trash2 size={13} color="#adb5bd" strokeWidth={2} />
                    </Pressable>
                  )}
                </>
              )}
            </View>
            <Text style={styles.feedTitle} numberOfLines={2}>{item.title || "핫템"}</Text>
            {item.review && <Text style={styles.feedMemoText} numberOfLines={1}>{item.review}</Text>}
          </Pressable>

          <View style={styles.feedActionRow}>
            {item.amount && item.amount > 0 ? (
              <View style={styles.feedAmtRow}>
                <Text style={styles.feedAmt}>{item.amount.toLocaleString()}</Text>
                <Text style={styles.feedAmtUnit}>원</Text>
              </View>
            ) : <View style={{ flex: 1 }} />}

            <View style={styles.inlineActions}>
              <Pressable onPress={() => onToggleReaction(item.sharedItemId, "❤️")} style={styles.inlineActionBtn}>
                <Heart size={17} color={heartReaction?.reacted ? "#f04452" : "#c9cdd2"} fill={heartReaction?.reacted ? "#f04452" : "transparent"} strokeWidth={1.8} />
                <Text style={[styles.inlineActionCount, { color: heartReaction?.reacted ? "#f04452" : "#c9cdd2", opacity: (heartReaction?.count ?? 0) > 0 ? 1 : 0 }]}>
                  {heartReaction?.count || 0}
                </Text>
              </Pressable>
              <Pressable onPress={onToggle} style={styles.inlineActionBtn}>
                <MessageCircle size={17} color={isOpen ? "#3182f6" : "#c9cdd2"} fill={isOpen ? "#dbeafe" : "transparent"} strokeWidth={1.8} />
                <Text style={[styles.inlineActionCount, { color: isOpen ? "#3182f6" : "#c9cdd2", opacity: item.commentCount > 0 ? 1 : 0 }]}>
                  {item.commentCount || 0}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </View>

      {isOpen && (
        <View style={styles.commentsSection}>
          <View style={styles.commentsList}>
            {comments.length === 0 && <Text style={styles.commentsEmpty}>첫 댓글을 남겨보세요</Text>}
            {comments.map((c) => (
              <View key={c.id} style={styles.commentItem}>
                <View style={[styles.commentAvatar, { backgroundColor: getAvatarColor(c.username) }]}>
                  <Text style={styles.commentAvatarText}>{c.username.charAt(0).toUpperCase()}</Text>
                </View>
                <View style={styles.commentContent}>
                  <View style={styles.commentHeader}>
                    <Text style={styles.commentNickname}>{c.username}</Text>
                    <Text style={styles.commentTime}>{formatDistanceToNow(new Date(c.createdAt), { addSuffix: true, locale: ko })}</Text>
                    {myId === c.userId && onDeleteComment && (
                      <Pressable
                        onPress={() => Alert.alert("댓글 삭제", "댓글을 삭제할까요?", [
                          { text: "취소", style: "cancel" },
                          { text: "삭제", style: "destructive", onPress: () => onDeleteComment(c.id) },
                        ])}
                        hitSlop={8}
                        style={({ pressed }) => [{ marginLeft: "auto" }, pressed && { opacity: 0.5 }]}
                      >
                        <Trash2 size={12} color="#c9cdd2" strokeWidth={2} />
                      </Pressable>
                    )}
                  </View>
                  <Text style={styles.commentBody}>{c.content}</Text>
                </View>
              </View>
            ))}
          </View>
          <View style={styles.commentInputRow}>
            <TextInput
              style={styles.commentInput}
              placeholder="댓글을 남겨보세요..."
              placeholderTextColor="#adb5bd"
              value={commentText}
              onChangeText={onCommentTextChange}
            />
            <Pressable
              disabled={!commentText.trim() || isAddingComment}
              onPress={() => onAddComment(item.sharedItemId, commentText, () => onCommentTextChange(""))}
              style={[styles.commentSendBtn, commentText.trim() && styles.commentSendBtnActive]}
            >
              <ArrowUp size={16} color={commentText.trim() ? "#fff" : "#adb5bd"} strokeWidth={3} />
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  feedCard: { backgroundColor: "#fff", borderBottomWidth: 10, borderBottomColor: "#f2f4f6" },
  feedCardBody: { flexDirection: "row", paddingHorizontal: 16, paddingTop: 16, paddingBottom: 10 },
  feedImageContainer: { width: 84, height: 84, borderRadius: 14, overflow: "hidden", alignItems: "center", justifyContent: "center", backgroundColor: "#f8f9fa", marginRight: 14 },
  feedImage: { width: "100%", height: "100%" },
  feedMainContent: { flex: 1, width: 0, justifyContent: "space-between" },
  feedInfo: { flex: 1 },
  feedMeta: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  feedCatBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginRight: 4 },
  feedCatBadgeText: { fontSize: 9, fontWeight: "800" },
  viewCountBadge: { flexDirection: "row", alignItems: "center", gap: 2, marginRight: 6 },
  viewCountText: { fontSize: 10, color: "#adb5bd", fontWeight: "600" },
  feedSender: { fontSize: 13, fontWeight: "700", color: "#4e5968", maxWidth: "50%" },
  feedTime: { fontSize: 11, color: "#adb5bd", marginLeft: "auto" },
  deleteBtn: { marginLeft: 6 },
  feedTitle: { fontSize: 15, fontWeight: "700", color: "#191f28", lineHeight: 22 },
  feedMemoText: { fontSize: 13, color: "#8b95a1", marginTop: 6, lineHeight: 18 },
  feedActionRow: { flexDirection: "row", alignItems: "center", marginTop: 10 },
  feedAmtRow: { flex: 1, flexDirection: "row", alignItems: "baseline", marginRight: 8 },
  feedAmt: { fontSize: 17, fontWeight: "900", color: "#191f28" },
  feedAmtUnit: { fontSize: 12, fontWeight: "700", color: "#191f28" },
  inlineActions: { flexDirection: "row", alignItems: "center", gap: 12, flexShrink: 0, marginRight: 4 },
  inlineActionBtn: { flexDirection: "column", alignItems: "center", gap: 2 },
  inlineActionCount: { fontSize: 13, fontWeight: "800", color: "#8b95a1" },
  commentsSection: { backgroundColor: "#f8f9fa", borderTopWidth: 1, borderTopColor: "#f2f4f6" },
  commentsList: { paddingVertical: 12 },
  commentsEmpty: { paddingVertical: 20, textAlign: "center", fontSize: 13, color: "#adb5bd", fontWeight: "500" },
  commentItem: { flexDirection: "row", gap: 10, paddingHorizontal: 16, paddingVertical: 8, alignItems: "flex-start" },
  commentAvatar: { width: 24, height: 24, borderRadius: 8, alignItems: "center", justifyContent: "center", marginTop: 2 },
  commentAvatarText: { color: "#fff", fontSize: 10, fontWeight: "800" },
  commentContent: { flex: 1, gap: 2 },
  commentHeader: { flexDirection: "row", alignItems: "center", gap: 6 },
  commentNickname: { fontSize: 13, fontWeight: "700", color: "#191f28" },
  commentTime: { fontSize: 11, color: "#adb5bd" },
  commentBody: { fontSize: 14, color: "#4e5968", lineHeight: 20 },
  commentInputRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 12, paddingVertical: 10, backgroundColor: "#fff", borderTopWidth: 1, borderTopColor: "#f2f4f6" },
  commentInput: { flex: 1, height: 38, backgroundColor: "#f2f4f6", borderRadius: 12, paddingHorizontal: 14, fontSize: 14, color: "#191f28" },
  commentSendBtn: { width: 34, height: 34, borderRadius: 10, backgroundColor: "#e5e8eb", alignItems: "center", justifyContent: "center" },
  commentSendBtnActive: { backgroundColor: "#3182f6" },
});
