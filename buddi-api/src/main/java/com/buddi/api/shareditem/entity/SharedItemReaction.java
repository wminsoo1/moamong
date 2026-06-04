package com.buddi.api.shareditem.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "shared_item_reactions",
        uniqueConstraints = @UniqueConstraint(columnNames = {"shared_item_id", "user_id", "emoji"}))
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class SharedItemReaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shared_item_id", nullable = false)
    private SharedItem sharedItem;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false)
    private String emoji;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    static SharedItemReaction of(SharedItem sharedItem, Long userId, String emoji) {
        SharedItemReaction r = new SharedItemReaction();
        r.sharedItem = sharedItem;
        r.userId = userId;
        r.emoji = emoji;
        return r;
    }
}
