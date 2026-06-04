package com.buddi.api.shareditem.entity;

import jakarta.persistence.*;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "shared_items",
        indexes = @Index(name = "idx_shared_items_user_id", columnList = "user_id"))
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class SharedItem {

    private static final Set<String> ALLOWED_EMOJIS = Set.of("❤️", "🛍️");

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String url;

    @Column(columnDefinition = "TEXT")
    private String imageUrl;

    private String memo;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SharedItemCategory category;

    private Long spendingId;

    private Long amount;

    @Column(nullable = false)
    private boolean isPublic = false;

    @Column(nullable = false)
    private int viewCount = 0;

    @OneToMany(mappedBy = "sharedItem", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("createdAt ASC")
    private List<SharedItemComment> comments = new ArrayList<>();

    @OneToMany(mappedBy = "sharedItem", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<SharedItemReaction> reactions = new ArrayList<>();

    @OneToMany(mappedBy = "sharedItem", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<SharedItemRoomShare> roomShares = new ArrayList<>();

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public SharedItemComment addComment(Long userId, String content) {
        if (content == null || content.isBlank()) throw new IllegalArgumentException("댓글 내용을 입력해주세요");
        SharedItemComment comment = SharedItemComment.of(this, userId, content);
        comments.add(comment);
        return comment;
    }

    public void toggleReaction(Long userId, String emoji) {
        if (!ALLOWED_EMOJIS.contains(emoji)) throw new IllegalArgumentException("지원하지 않는 이모지입니다");
        boolean removed = reactions.removeIf(r -> r.getUserId().equals(userId) && r.getEmoji().equals(emoji));
        if (!removed) {
            reactions.add(SharedItemReaction.of(this, userId, emoji));
        }
    }

    public void incrementViewCount() {
        this.viewCount++;
    }

    public void shareToRoom(Long roomId) {
        boolean alreadyShared = roomShares.stream().anyMatch(rs -> rs.getRoomId().equals(roomId));
        if (!alreadyShared) {
            roomShares.add(SharedItemRoomShare.of(this, roomId));
        }
    }

    public void shareToRooms(List<Long> roomIds) {
        roomIds.forEach(this::shareToRoom);
    }

    public static SharedItem of(Long userId, String title, String url, String imageUrl, String memo,
                                SharedItemCategory category, Long spendingId, Long amount, boolean isPublic) {
        if (title == null || title.isBlank()) throw new IllegalArgumentException("제목을 입력해주세요");
        if (url == null || url.isBlank()) throw new IllegalArgumentException("링크를 입력해주세요");
        if (category == null) throw new IllegalArgumentException("카테고리를 선택해주세요");
        SharedItem item = new SharedItem();
        item.userId = userId;
        item.title = title;
        item.url = url;
        item.imageUrl = imageUrl;
        item.memo = memo;
        item.category = category;
        item.spendingId = spendingId;
        item.amount = amount;
        item.isPublic = isPublic;
        return item;
    }
}
