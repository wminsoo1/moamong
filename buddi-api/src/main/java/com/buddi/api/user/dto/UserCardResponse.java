package com.buddi.api.user.dto;

import com.buddi.api.user.entity.UserCard;

public record UserCardResponse(Long cardId, String name, String company, Integer annualFee, String imageUrl) {
    public UserCardResponse(UserCard uc) {
        this(uc.getCard().getId(), uc.getCard().getName(), uc.getCard().getCompany(),
                uc.getCard().getAnnualFee(), uc.getCard().getImageUrl());
    }
}
