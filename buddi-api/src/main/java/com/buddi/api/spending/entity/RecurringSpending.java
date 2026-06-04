package com.buddi.api.spending.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "recurring_spendings",
        indexes = @Index(name = "idx_recurring_spendings_user_id", columnList = "user_id"))
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class RecurringSpending {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SpendingType type;

    @Column(nullable = false)
    private String categoryName;

    @Column(nullable = false)
    private String categoryGroup;

    @Column(nullable = false)
    private Long amount;

    @Column(nullable = false)
    private int dayOfMonth;

    @Column(nullable = false)
    private LocalDate startDate;

    private LocalDate endDate;

    private String memo;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Builder(access = AccessLevel.PRIVATE)
    private RecurringSpending(Long userId, SpendingType type, String categoryName,
                               String categoryGroup, Long amount, int dayOfMonth,
                               LocalDate startDate, LocalDate endDate, String memo) {
        this.userId = userId;
        this.type = type;
        this.categoryName = categoryName;
        this.categoryGroup = categoryGroup;
        this.amount = amount;
        this.dayOfMonth = dayOfMonth;
        this.startDate = startDate;
        this.endDate = endDate;
        this.memo = memo;
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public static RecurringSpending of(Long userId, SpendingType type, String categoryName,
                                        String categoryGroup, Long amount, int dayOfMonth,
                                        LocalDate startDate, LocalDate endDate, String memo) {
        if (amount == null || amount <= 0) throw new IllegalArgumentException("금액은 0보다 커야 합니다");
        if (dayOfMonth < 1 || dayOfMonth > 28) throw new IllegalArgumentException("날짜는 1~28일 사이여야 합니다");
        if (endDate != null && endDate.isBefore(startDate)) throw new IllegalArgumentException("종료일은 시작일보다 이후여야 합니다");
        return RecurringSpending.builder()
                .userId(userId)
                .type(type)
                .categoryName(categoryName)
                .categoryGroup(categoryGroup)
                .amount(amount)
                .dayOfMonth(dayOfMonth)
                .startDate(startDate)
                .endDate(endDate)
                .memo(memo)
                .build();
    }

    public void update(SpendingType type, String categoryName, String categoryGroup,
                       Long amount, int dayOfMonth, LocalDate startDate, LocalDate endDate, String memo) {
        if (amount == null || amount <= 0) throw new IllegalArgumentException("금액은 0보다 커야 합니다");
        if (dayOfMonth < 1 || dayOfMonth > 28) throw new IllegalArgumentException("날짜는 1~28일 사이여야 합니다");
        if (endDate != null && endDate.isBefore(startDate)) throw new IllegalArgumentException("종료일은 시작일보다 이후여야 합니다");
        this.type = type;
        this.categoryName = categoryName;
        this.categoryGroup = categoryGroup;
        this.amount = amount;
        this.dayOfMonth = dayOfMonth;
        this.startDate = startDate;
        this.endDate = endDate;
        this.memo = memo;
    }
}
