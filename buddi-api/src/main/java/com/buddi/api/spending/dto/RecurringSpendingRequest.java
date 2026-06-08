package com.buddi.api.spending.dto;

import com.buddi.api.spending.entity.SpendingType;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;

import java.time.LocalDate;

@Getter
public class RecurringSpendingRequest {
    @NotNull(message = "타입을 선택해주세요")
    private SpendingType type;
    private Long categoryId;
    private String categoryGroupKey;
    @NotNull(message = "금액을 입력해주세요")
    @Min(value = 0, message = "금액은 0 이상이어야 합니다")
    private Long amount;
    @Min(value = 1, message = "일자는 1 이상이어야 합니다")
    @Max(value = 28, message = "일자는 28 이하여야 합니다")
    private int dayOfMonth;
    @NotNull(message = "시작일을 선택해주세요")
    private LocalDate startDate;
    private LocalDate endDate;
    @Size(max = 500, message = "메모는 500자 이하로 입력해주세요")
    private String memo;
}
