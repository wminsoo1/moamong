package com.buddi.api.spending.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "spendings",
        indexes = @Index(name = "idx_spendings_user_id_date", columnList = "user_id, date"))
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Spending {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SpendingType type;

    @Column(nullable = false)
    private String categoryName;

    @Column(nullable = false)
    private String categoryGroup;

    @Column(nullable = false)
    private Long amount;

    @Column(nullable = false)
    private LocalDate date;

    private String memo;

    private String imageUrl;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "spending", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("createdAt ASC")
    private List<SpendingComment> comments = new ArrayList<>();

    @OneToMany(mappedBy = "spending", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<SpendingLike> likes = new ArrayList<>();

    @Builder(access = AccessLevel.PRIVATE)
    private Spending(Long userId, SpendingType type, String categoryName,
                     String categoryGroup, Long amount, LocalDate date, String memo, String imageUrl,
                     LocalDateTime createdAt) {
        this.userId = userId;
        this.type = type;
        this.categoryName = categoryName;
        this.categoryGroup = categoryGroup;
        this.amount = amount;
        this.date = date;
        this.memo = memo;
        this.imageUrl = imageUrl;
        this.createdAt = createdAt;
    }

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) createdAt = LocalDateTime.now();
    }

    public SpendingComment addComment(Long userId, String content) {
        if (content == null || content.isBlank()) throw new IllegalArgumentException("댓글 내용을 입력해주세요");
        SpendingComment comment = SpendingComment.of(this, userId, content);
        comments.add(comment);
        return comment;
    }

    public boolean isLikedBy(Long userId) {
        return likes.stream().anyMatch(l -> l.getUserId().equals(userId));
    }

    public void toggleLike(Long userId) {
        boolean removed = likes.removeIf(l -> l.getUserId().equals(userId));
        if (!removed) likes.add(SpendingLike.of(this, userId));
    }

    public void removeComment(Long commentId, Long requesterId) {
        SpendingComment comment = comments.stream()
                .filter(c -> c.getId().equals(commentId))
                .findFirst()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "댓글이 없습니다"));
        comment.validateOwner(requesterId);
        comments.remove(comment);
    }

    public void update(SpendingType type, String categoryName, String categoryGroup,
                       Long amount, LocalDate date, String memo, String imageUrl) {
        if (amount == null || amount <= 0) throw new IllegalArgumentException("금액은 0보다 커야 합니다");
        this.type = type;
        this.categoryName = categoryName;
        this.categoryGroup = categoryGroup;
        this.amount = amount;
        this.date = date;
        this.memo = memo;
        this.imageUrl = imageUrl;
    }

    public static Spending of(Long userId, SpendingType type, String categoryName,
                               String categoryGroup, Long amount, LocalDate date, String memo, String imageUrl) {
        if (amount == null || amount <= 0) throw new IllegalArgumentException("금액은 0보다 커야 합니다");
        return Spending.builder()
                .userId(userId)
                .type(type)
                .categoryName(categoryName)
                .categoryGroup(categoryGroup)
                .amount(amount)
                .date(date)
                .memo(memo)
                .imageUrl(imageUrl)
                .build();
    }

    public static Spending of(Long userId, SpendingType type, String categoryName,
                               String categoryGroup, Long amount, LocalDate date, String memo, String imageUrl,
                               LocalDateTime createdAt) {
        if (amount == null || amount <= 0) throw new IllegalArgumentException("금액은 0보다 커야 합니다");
        return Spending.builder()
                .userId(userId)
                .type(type)
                .categoryName(categoryName)
                .categoryGroup(categoryGroup)
                .amount(amount)
                .date(date)
                .memo(memo)
                .imageUrl(imageUrl)
                .createdAt(createdAt)
                .build();
    }
}
