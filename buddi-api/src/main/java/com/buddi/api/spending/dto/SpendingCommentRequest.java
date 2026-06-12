package com.buddi.api.spending.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;

@Getter
public class SpendingCommentRequest {

    @NotBlank(message = "댓글 내용을 입력해주세요")
    @Size(max = 200, message = "댓글은 200자 이하로 입력해주세요")
    private String content;
}
