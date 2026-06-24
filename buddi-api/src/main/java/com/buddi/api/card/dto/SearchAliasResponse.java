package com.buddi.api.card.dto;

import com.buddi.api.card.entity.SearchAlias;

public record SearchAliasResponse(String keyword, String category, String merchant) {

    public SearchAliasResponse(SearchAlias alias) {
        this(alias.getKeyword(), alias.getCategory(), alias.getMerchant());
    }
}
