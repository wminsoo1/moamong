package com.buddi.api.user.dto;

import com.buddi.api.user.entity.CategoryGroup;
import com.buddi.api.user.entity.CategoryGroupMeta;

public record CategoryGroupResponse(
        String groupKey,
        String label,
        String color,
        String icon,
        int sortOrder
) {
    public static CategoryGroupResponse from(CategoryGroup g) {
        return new CategoryGroupResponse(
                g.getGroupKey(),
                CategoryGroupMeta.labelOf(g.getGroupKey()),
                g.getColor(),
                g.getIcon(),
                g.getSortOrder()
        );
    }
}
