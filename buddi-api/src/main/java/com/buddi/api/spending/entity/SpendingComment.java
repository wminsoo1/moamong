package com.buddi.api.spending.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;

@Entity
@Table(name = "spending_comments",
        indexes = @Index(name = "idx_spending_comments_spending_id", columnList = "spending_id"))
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class SpendingComment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "spending_id", nullable = false)
    private Spending spending;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false)
    private Long roomId;

    @Column(nullable = false)
    private String type; // TEXT | VOICE

    @Column(length = 200)
    private String content;

    private String audioUrl;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public static SpendingComment of(Spending spending, Long roomId, Long userId, String content) {
        SpendingComment comment = new SpendingComment();
        comment.spending = spending;
        comment.roomId = roomId;
        comment.userId = userId;
        comment.type = "TEXT";
        comment.content = content;
        comment.createdAt = LocalDateTime.now();
        return comment;
    }

    public static SpendingComment ofVoice(Spending spending, Long roomId, Long userId, String audioUrl) {
        SpendingComment comment = new SpendingComment();
        comment.spending = spending;
        comment.roomId = roomId;
        comment.userId = userId;
        comment.type = "VOICE";
        comment.audioUrl = audioUrl;
        comment.createdAt = LocalDateTime.now();
        return comment;
    }

    public void validateOwner(Long userId) {
        if (!this.userId.equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "권한이 없습니다");
        }
    }
}
