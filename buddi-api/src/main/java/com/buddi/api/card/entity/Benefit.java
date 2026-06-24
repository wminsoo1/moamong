package com.buddi.api.card.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "benefits")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Benefit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_id", nullable = false)
    private BenefitGroup group;

    @Column(nullable = false)
    private String category;

    @Column(columnDefinition = "TEXT")
    private String merchants;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DiscountType discountType;

    @Column(nullable = false)
    private double discountValue;

    private Integer monthlyLimit;

    private Integer perTxnLimit;

    private Integer perTxnAmountLimit;

    private Integer monthlyCount;

    private Integer dailyCount;

    private String timeCondition;

    private Integer prevMonthOverride;

    @Column(columnDefinition = "TEXT")
    private String conditions;

    public static Benefit of(BenefitGroup group, String category, String merchants,
                             DiscountType discountType, double discountValue,
                             Integer monthlyLimit, Integer perTxnLimit, Integer perTxnAmountLimit,
                             Integer monthlyCount, Integer dailyCount, String timeCondition,
                             Integer prevMonthOverride, String conditions) {
        if (category == null || category.isBlank()) throw new IllegalArgumentException("혜택 카테고리를 입력해주세요");
        if (discountType == null) throw new IllegalArgumentException("할인 타입을 선택해주세요");
        if (discountValue <= 0) throw new IllegalArgumentException("할인값은 0보다 커야 합니다");

        Benefit benefit = new Benefit();
        benefit.group = group;
        benefit.category = category;
        benefit.merchants = merchants;
        benefit.discountType = discountType;
        benefit.discountValue = discountValue;
        benefit.monthlyLimit = monthlyLimit;
        benefit.perTxnLimit = perTxnLimit;
        benefit.perTxnAmountLimit = perTxnAmountLimit;
        benefit.monthlyCount = monthlyCount;
        benefit.dailyCount = dailyCount;
        benefit.timeCondition = timeCondition;
        benefit.prevMonthOverride = prevMonthOverride;
        benefit.conditions = conditions;
        return benefit;
    }
}
