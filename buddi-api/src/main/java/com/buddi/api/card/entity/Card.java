package com.buddi.api.card.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "cards")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Card {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String company;

    private Integer annualFee;

    private Integer annualFeeOverseas;

    private Integer prevMonthMin;

    @Enumerated(EnumType.STRING)
    private PrevMonthExcludeType prevMonthExcludeType;

    private String imageUrl;

    @OneToMany(mappedBy = "card", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<BenefitGroup> benefitGroups = new ArrayList<>();

    public static Card of(String name, String company, Integer annualFee, Integer annualFeeOverseas,
                          Integer prevMonthMin, PrevMonthExcludeType prevMonthExcludeType, String imageUrl) {
        if (name == null || name.isBlank()) throw new IllegalArgumentException("카드명을 입력해주세요");
        if (company == null || company.isBlank()) throw new IllegalArgumentException("카드사를 입력해주세요");

        Card card = new Card();
        card.name = name;
        card.company = company;
        card.annualFee = annualFee;
        card.annualFeeOverseas = annualFeeOverseas;
        card.prevMonthMin = prevMonthMin;
        card.prevMonthExcludeType = prevMonthExcludeType;
        card.imageUrl = imageUrl;
        return card;
    }

    public BenefitGroup addBenefitGroup(BenefitGroupType type, String label, int maxSelect) {
        BenefitGroup group = BenefitGroup.of(this, type, label, maxSelect);
        benefitGroups.add(group);
        return group;
    }
}
