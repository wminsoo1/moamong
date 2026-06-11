package com.buddi.api.shareditem.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "shared_item_comments")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class SharedItemComment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shared_item_id", nullable = false)
    private SharedItem sharedItem;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false, length = 500)
    private String content;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    static SharedItemComment of(SharedItem sharedItem, Long userId, String content) {
        SharedItemComment c = new SharedItemComment();
        c.sharedItem = sharedItem;
        c.userId = userId;
        c.content = content;
        c.createdAt = LocalDateTime.now();
        return c;
    }
}
