package com.buddi.api.spending.dto;

import com.buddi.api.spending.entity.RecurringSpending;
import com.buddi.api.user.entity.CategoryGroupMeta;
import lombok.Getter;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;

@Getter
public class RecurringSpendingResponse {
    private final Long id;
    private final String type;
    private final String categoryName;
    private final String categoryGroup;
    private final String categoryGroupLabel;
    private final Long amount;
    private final int dayOfMonth;
    private final LocalDate startDate;
    private final LocalDate endDate;
    private final String memo;
    private final OffsetDateTime createdAt;

    public RecurringSpendingResponse(RecurringSpending r) {
        this.id = r.getId();
        this.type = r.getType().name();
        this.categoryName = r.getCategoryName();
        this.categoryGroup = r.getCategoryGroup();
        this.categoryGroupLabel = CategoryGroupMeta.labelOf(r.getCategoryGroup());
        this.amount = r.getAmount();
        this.dayOfMonth = r.getDayOfMonth();
        this.startDate = r.getStartDate();
        this.endDate = r.getEndDate();
        this.memo = r.getMemo();
        this.createdAt = r.getCreatedAt().atOffset(ZoneOffset.UTC).withOffsetSameInstant(ZoneOffset.ofHours(9));
    }
}
