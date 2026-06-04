package com.buddi.api.shareditem.dto;

import com.buddi.api.shareditem.entity.SharedItem;

public record SharedItemResponse(Long sharedItemId, String url, String title, String imageUrl, String memo, String category) {
    public SharedItemResponse(SharedItem item) {
        this(item.getId(), item.getUrl(), item.getTitle(), item.getImageUrl(), item.getMemo(),
                item.getCategory().name());
    }
}
