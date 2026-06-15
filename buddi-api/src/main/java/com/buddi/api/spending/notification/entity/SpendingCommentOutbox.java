package com.buddi.api.spending.notification.entity;

import com.buddi.api.shareditem.notification.entity.OutboxStatus;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "spending_comment_outbox",
        indexes = @Index(name = "idx_spending_comment_outbox_status", columnList = "status, claimed_at"))
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class SpendingCommentOutbox {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long spendingId;

    @Column(nullable = false)
    private Long actorId;

    @Column(nullable = false)
    private Long ownerId;

    @Column
    private String categoryName;

    @Column
    private String memo;

    @Column(nullable = false)
    private long amount;

    @Column(nullable = false)
    private String commentType;

    @Column(length = 500)
    private String commentContent;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OutboxStatus status;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column
    private LocalDateTime claimedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.status = OutboxStatus.PENDING;
    }

    public void markPending() {
        this.status = OutboxStatus.PENDING;
        this.claimedAt = null;
    }

    public void markProcessing() {
        this.status = OutboxStatus.PROCESSING;
        this.claimedAt = LocalDateTime.now();
    }

    public void markProcessed() {
        this.status = OutboxStatus.PROCESSED;
    }

    public static SpendingCommentOutbox of(Long spendingId, Long actorId, Long ownerId, String categoryName, String memo, long amount, String commentType, String commentContent) {
        SpendingCommentOutbox outbox = new SpendingCommentOutbox();
        outbox.spendingId = spendingId;
        outbox.actorId = actorId;
        outbox.ownerId = ownerId;
        outbox.categoryName = categoryName;
        outbox.memo = memo;
        outbox.amount = amount;
        outbox.commentType = commentType;
        outbox.commentContent = commentContent;
        return outbox;
    }
}
