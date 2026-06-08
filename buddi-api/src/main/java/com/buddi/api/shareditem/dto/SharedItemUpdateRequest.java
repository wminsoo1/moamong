package com.buddi.api.shareditem.dto;

import com.buddi.api.shareditem.entity.SharedItemCategory;
import jakarta.validation.constraints.Size;

public record SharedItemUpdateRequest(
        @Size(max = 200, message = "제목은 200자 이하로 입력해주세요")
        String title,
        @Size(max = 2000, message = "URL은 2000자 이하여야 합니다")
        String url,
        @Size(max = 1000, message = "이미지 URL은 1000자 이하여야 합니다")
        String imageUrl,
        @Size(max = 1000, message = "한마디는 1000자 이하로 입력해주세요")
        String memo,
        SharedItemCategory category,
        Long amount
) {}
