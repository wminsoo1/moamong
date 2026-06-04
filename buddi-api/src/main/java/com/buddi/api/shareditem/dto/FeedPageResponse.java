package com.buddi.api.shareditem.dto;

import java.util.List;

public record FeedPageResponse(
        List<SharedItemFeedResponse> content,
        boolean hasNext,
        Long nextCursor
) {}
