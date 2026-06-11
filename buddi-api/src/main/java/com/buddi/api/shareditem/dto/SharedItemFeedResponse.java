package com.buddi.api.shareditem.dto;

import java.time.OffsetDateTime;
import java.util.List;

public record SharedItemFeedResponse(
        Long sharedItemId,
        Long userId,
        String shareGroupId,
        String senderUsername,
        Long amount,
        String url,
        String title,
        String imageUrl,
        String review,
        String category,
        OffsetDateTime createdAt,
        List<ReactionSummary> reactions,
        int commentCount,
        int viewCount
) {}
