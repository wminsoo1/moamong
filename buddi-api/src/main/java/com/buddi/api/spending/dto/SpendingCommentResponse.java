package com.buddi.api.spending.dto;

import java.time.OffsetDateTime;

public record SpendingCommentResponse(
        Long id,
        Long userId,
        String username,
        String type,
        String content,
        String audioUrl,
        OffsetDateTime createdAt
) {}
