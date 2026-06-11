package com.buddi.api.spending.dto;

import com.buddi.api.spending.entity.Spending;
import com.buddi.api.user.entity.CategoryGroupMeta;
import lombok.Getter;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;

@Getter
public class SpendingListResponse {
    private final Long id;
    private final String type;
    private final String categoryName;
    private final String categoryGroup;
    private final String categoryGroupLabel;
    private final Long amount;
    private final LocalDate date;
    private final String memo;
    private final String imageUrl;
    private final OffsetDateTime createdAt;

    public SpendingListResponse(Spending spending) {
        this.id = spending.getId();
        this.type = spending.getType().name();
        this.categoryName = spending.getCategoryName();
        this.categoryGroup = spending.getCategoryGroup();
        this.categoryGroupLabel = CategoryGroupMeta.labelOf(spending.getCategoryGroup());
        this.amount = spending.getAmount();
        this.date = spending.getDate();
        this.memo = spending.getMemo();
        this.imageUrl = spending.getImageUrl();
        this.createdAt = spending.getCreatedAt() != null
                ? spending.getCreatedAt().atOffset(ZoneOffset.UTC)
                : null;
    }
}
