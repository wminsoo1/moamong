package com.buddi.api.spending.dto;

import com.buddi.api.spending.entity.SpendingType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;

import java.time.LocalDate;

@Getter
public class SpendingRequest {
    @NotNull(message = "타입을 선택해주세요")
    private SpendingType type;
    private Long categoryId;
    private String categoryGroupKey;
    @NotNull(message = "금액을 입력해주세요")
    @Min(value = 0, message = "금액은 0 이상이어야 합니다")
    private Long amount;
    @NotNull(message = "날짜를 선택해주세요")
    private LocalDate date;
    @Size(max = 500, message = "메모는 500자 이하로 입력해주세요")
    private String memo;
    @Size(max = 1000, message = "이미지 URL은 1000자 이하여야 합니다")
    private String imageUrl;
}
