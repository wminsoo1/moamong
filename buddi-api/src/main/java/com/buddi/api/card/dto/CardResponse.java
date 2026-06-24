package com.buddi.api.card.dto;

import com.buddi.api.card.entity.Card;

public record CardResponse(Long id, String name, String company, Integer annualFee, String imageUrl) {
    public CardResponse(Card c) {
        this(c.getId(), c.getName(), c.getCompany(), c.getAnnualFee(), c.getImageUrl());
    }
}
