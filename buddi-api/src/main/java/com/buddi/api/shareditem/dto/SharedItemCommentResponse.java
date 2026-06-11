package com.buddi.api.shareditem.dto;

import java.time.OffsetDateTime;

public record SharedItemCommentResponse(Long id, Long userId, String username, String content, OffsetDateTime createdAt) {}
