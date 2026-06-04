package com.buddi.api.user.dto;

import com.buddi.api.user.entity.Category;
import com.buddi.api.user.entity.CategoryGroupMeta;

public record CategoryResponse(
        Long id,
        String name,
        String type,
        String parentGroup,
        String parentGroupLabel,
        int sortOrder
) {
    public static CategoryResponse from(Category c) {
        return new CategoryResponse(
                c.getId(),
                c.getName(),
                c.getType().name(),
                c.getParentGroupKey(),
                CategoryGroupMeta.labelOf(c.getParentGroupKey()),
                c.getSortOrder()
        );
    }
}
