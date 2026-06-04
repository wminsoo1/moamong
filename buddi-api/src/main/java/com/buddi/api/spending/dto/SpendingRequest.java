package com.buddi.api.spending.dto;

import com.buddi.api.spending.entity.SpendingType;
import lombok.Getter;

import java.time.LocalDate;

@Getter
public class SpendingRequest {
    private SpendingType type;
    private Long categoryId;         // 소카테고리 선택 시 사용 (선택)
    private String categoryGroupKey; // 소카테고리 미선택 시 대카테고리 키 (categoryId 없을 때 필수)
    private Long amount;
    private LocalDate date;
    private String memo;
}
