package com.buddi.api.shareditem.dto;

import com.buddi.api.shareditem.entity.SharedItemCategory;

import java.util.List;

public record ManualSharedItemRequest(String url, String title, String imageUrl, String memo, SharedItemCategory category, List<Long> roomIds, boolean isPublic) {}
