package com.buddi.api.shareditem.dto;

import com.buddi.api.shareditem.entity.SharedItemCategory;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

public record SharedItemRequest(
        @Size(max = 2000, message = "URL은 2000자 이하여야 합니다")
        String url,
        @NotBlank(message = "제목을 입력해주세요")
        @Size(max = 200, message = "제목은 200자 이하로 입력해주세요")
        String title,
        @Size(max = 1000, message = "이미지 URL은 1000자 이하여야 합니다")
        String imageUrl,
        @Size(max = 1000, message = "한마디는 1000자 이하로 입력해주세요")
        String review,
        @NotNull(message = "카테고리를 선택해주세요")
        SharedItemCategory category,
        Long amount,
        @NotEmpty(message = "공유할 방을 선택해주세요")
        List<Long> roomIds,
        boolean isPublic
) {}
