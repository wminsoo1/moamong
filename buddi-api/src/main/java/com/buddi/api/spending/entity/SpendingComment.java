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

    @Column(nullable = false, length = 200)
    private String content;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public static SpendingComment of(Spending spending, Long userId, String content) {
        SpendingComment comment = new SpendingComment();
        comment.spending = spending;
        comment.userId = userId;
        comment.content = content;
        comment.createdAt = LocalDateTime.now();
        return comment;
    }

    public void validateOwner(Long userId) {
        if (!this.userId.equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "권한이 없습니다");
        }
    }
}
