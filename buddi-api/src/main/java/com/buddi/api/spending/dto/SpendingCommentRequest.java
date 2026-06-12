package com.buddi.api.spending.dto;

import jakarta.validation.constraints.Size;
import lombok.Getter;

@Getter
public class SpendingCommentRequest {

    private String type; // TEXT | VOICE (default: TEXT)

    @Size(max = 200, message = "댓글은 200자 이하로 입력해주세요")
    private String content;

    private String audioUrl;

    public String getEffectiveType() {
        return type == null ? "TEXT" : type;
    }
}
