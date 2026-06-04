package com.buddi.api.shareditem.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "shared_item_room_shares",
        uniqueConstraints = @UniqueConstraint(columnNames = {"shared_item_id", "room_id"}))
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class SharedItemRoomShare {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shared_item_id", nullable = false)
    private SharedItem sharedItem;

    @Column(name = "room_id", nullable = false)
    private Long roomId;

    @Column(nullable = false, updatable = false)
    private LocalDateTime sharedAt;

    @PrePersist
    protected void onShare() {
        sharedAt = LocalDateTime.now();
    }

    static SharedItemRoomShare of(SharedItem sharedItem, Long roomId) {
        SharedItemRoomShare share = new SharedItemRoomShare();
        share.sharedItem = sharedItem;
        share.roomId = roomId;
        return share;
    }
}
