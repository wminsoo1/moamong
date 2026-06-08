package com.buddi.api.shareditem.dto;

import java.time.LocalDateTime;

public record SharedItemCommentResponse(Long id, Long userId, String username, String content, LocalDateTime createdAt) {}
