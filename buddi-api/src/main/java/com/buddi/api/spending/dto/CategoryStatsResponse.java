package com.buddi.api.spending.dto;

import java.util.List;

public record CategoryStatsResponse(
        int year,
        int month,
        long totalAmount,
        long lastMonthTotalAmount,
        List<CategoryEntry> categories
) {
    public record CategoryEntry(
            String categoryGroup,
            String categoryGroupLabel,
            long amount,
            long count,
            double percentage,
            long lastMonthAmount
    ) {}
}
