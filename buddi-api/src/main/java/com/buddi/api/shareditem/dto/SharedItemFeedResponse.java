package com.buddi.api.shareditem.dto;

import java.time.LocalDateTime;
import java.util.List;

public record SharedItemFeedResponse(
        Long sharedItemId,
        String senderUsername,
        Long amount,
        String url,
        String title,
        String imageUrl,
        String review,
        String category,
        LocalDateTime createdAt,
        List<ReactionSummary> reactions,
        int commentCount,
        int viewCount
) {}
