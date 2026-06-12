package com.buddi.api.spending.notification.entity;

import com.buddi.api.shareditem.notification.entity.OutboxStatus;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "spending_outbox",
        indexes = @Index(name = "idx_spending_outbox_status", columnList = "status, claimed_at"))
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class SpendingOutbox {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long spendingId;

    @Column(nullable = false)
    private Long senderId;

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

    public static SpendingOutbox of(Long spendingId, Long senderId, long amount, String categoryName, String memo) {
        SpendingOutbox outbox = new SpendingOutbox();
        outbox.spendingId = spendingId;
        outbox.senderId = senderId;
        outbox.amount = amount;
        outbox.categoryName = categoryName;
        outbox.memo = memo;
        return outbox;
    }
}
