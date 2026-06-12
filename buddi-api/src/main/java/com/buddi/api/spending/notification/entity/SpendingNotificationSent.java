package com.buddi.api.spending.notification.entity;

import com.buddi.api.shareditem.notification.entity.OutboxStatus;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "spending_notification_sent",
        uniqueConstraints = @UniqueConstraint(columnNames = {"outbox_id", "receiver_id"}),
        indexes = @Index(name = "idx_spending_notification_sent_status", columnList = "status, claimed_at"))
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class SpendingNotificationSent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "outbox_id", nullable = false)
    private Long outboxId;

    @Column(nullable = false)
    private Long senderId;

    @Column(nullable = false)
    private Long receiverId;

    @Column(nullable = false)
    private long amount;

    @Column
    private String categoryName;

    @Column
    private String memo;

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

    public static SpendingNotificationSent of(Long outboxId, Long senderId, Long receiverId,
                                               long amount, String categoryName, String memo) {
        SpendingNotificationSent sent = new SpendingNotificationSent();
        sent.outboxId = outboxId;
        sent.senderId = senderId;
        sent.receiverId = receiverId;
        sent.amount = amount;
        sent.categoryName = categoryName;
        sent.memo = memo;
        return sent;
    }
}
