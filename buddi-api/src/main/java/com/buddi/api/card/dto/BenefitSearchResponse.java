package com.buddi.api.card.dto;

import com.buddi.api.card.entity.Benefit;
import com.buddi.api.card.entity.BenefitGroup;
import com.buddi.api.card.entity.Card;

public record BenefitSearchResponse(
        Long cardId,
        String cardName,
        String company,
        String imageUrl,
        String category,
        String merchants,
        String discountType,
        double discountValue,
        String matchType,
        Integer monthlyLimit,
        Integer perTxnLimit,
        Integer perTxnAmountLimit,
        String timeCondition,
        String conditions,
        String benefitGroupType,
        String benefitGroupLabel
) {
    public static BenefitSearchResponse of(Benefit benefit, String matchType) {
        BenefitGroup group = benefit.getGroup();
        Card card = group.getCard();

        return new BenefitSearchResponse(
                card.getId(),
                card.getName(),
                card.getCompany(),
                card.getImageUrl(),
                benefit.getCategory(),
                benefit.getMerchants(),
                benefit.getDiscountType().name(),
                benefit.getDiscountValue(),
                matchType,
                benefit.getMonthlyLimit(),
                benefit.getPerTxnLimit(),
                benefit.getPerTxnAmountLimit(),
                benefit.getTimeCondition(),
                benefit.getConditions(),
                group.getType().name(),
                group.getLabel()
        );
    }
}
