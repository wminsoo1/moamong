package com.buddi.api.spending.dto;

import com.buddi.api.spending.entity.SpendingType;
import lombok.Getter;

import java.time.LocalDate;

@Getter
public class RecurringSpendingRequest {
    private SpendingType type;
    private Long categoryId;
    private String categoryGroupKey;
    private Long amount;
    private int dayOfMonth;
    private LocalDate startDate;
    private LocalDate endDate;
    private String memo;
}
