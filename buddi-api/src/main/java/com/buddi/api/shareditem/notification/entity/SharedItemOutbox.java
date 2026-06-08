package com.buddi.api.shareditem.notification.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Entity
@Table(name = "shared_item_outbox",
        indexes = @Index(name = "idx_shared_item_outbox_status", columnList = "status, claimed_at"))
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class SharedItemOutbox {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long sharedItemId;

    @Column(nullable = false)
    private Long senderId;

    @Column(nullable = false)
    private long amount;

    @Column
    private String url;

    @Column
    private String title;

    @Column
    private String memo;

    @Column(nullable = false)
    private String roomIds;

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

    public List<Long> getRoomIdList() {
        return Arrays.stream(roomIds.split(","))
                .map(Long::parseLong)
                .toList();
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

    public static SharedItemOutbox of(Long sharedItemId, Long senderId, long amount,
                                      String url, String title, String memo, List<Long> roomIds) {
        SharedItemOutbox outbox = new SharedItemOutbox();
        outbox.sharedItemId = sharedItemId;
        outbox.senderId = senderId;
        outbox.amount = amount;
        outbox.url = url;
        outbox.title = title;
        outbox.memo = memo;
        outbox.roomIds = roomIds.stream().map(String::valueOf).collect(Collectors.joining(","));
        return outbox;
    }
}
