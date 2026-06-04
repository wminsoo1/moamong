package com.buddi.api.shareditem.notification.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "notification_sent",
        uniqueConstraints = @UniqueConstraint(columnNames = {"outbox_id", "receiver_id"}),
        indexes = @Index(name = "idx_notification_sent_status", columnList = "status, claimed_at"))
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class NotificationSent {

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
    private String url;

    @Column
    private String title;

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

    public static NotificationSent of(Long outboxId, Long senderId, Long receiverId,
                                      long amount, String url, String title) {
        NotificationSent sent = new NotificationSent();
        sent.outboxId = outboxId;
        sent.senderId = senderId;
        sent.receiverId = receiverId;
        sent.amount = amount;
        sent.url = url;
        sent.title = title;
        return sent;
    }
}
