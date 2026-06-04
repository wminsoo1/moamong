package com.buddi.api.shareditem.dto;

import com.buddi.api.shareditem.entity.SharedItemCategory;

import java.util.List;

public record CreateSharedItemRequest(String url, String memo, SharedItemCategory category, List<Long> roomIds, boolean isPublic) {}
