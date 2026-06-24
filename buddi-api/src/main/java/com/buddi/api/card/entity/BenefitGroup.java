package com.buddi.api.card.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "benefit_groups")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class BenefitGroup {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "card_id", nullable = false)
    private Card card;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BenefitGroupType type;

    private String label;

    @Column(nullable = false)
    private int maxSelect = 1;

    @OneToMany(mappedBy = "group", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Benefit> benefits = new ArrayList<>();

    static BenefitGroup of(Card card, BenefitGroupType type, String label, int maxSelect) {
        if (type == null) throw new IllegalArgumentException("혜택 그룹 타입을 선택해주세요");

        BenefitGroup group = new BenefitGroup();
        group.card = card;
        group.type = type;
        group.label = label;
        group.maxSelect = maxSelect;
        return group;
    }

    public Benefit addBenefit(String category, String merchants,
                              DiscountType discountType, double discountValue,
                              Integer monthlyLimit, Integer perTxnLimit, Integer perTxnAmountLimit,
                              Integer monthlyCount, Integer dailyCount, String timeCondition,
                              Integer prevMonthOverride, String conditions) {
        Benefit benefit = Benefit.of(this, category, merchants, discountType, discountValue,
                monthlyLimit, perTxnLimit, perTxnAmountLimit,
                monthlyCount, dailyCount, timeCondition,
                prevMonthOverride, conditions);
        benefits.add(benefit);
        return benefit;
    }
}
