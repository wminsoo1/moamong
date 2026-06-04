package com.buddi.api.user.dto;

import com.buddi.api.spending.entity.SpendingType;

public record CategoryRequest(String name, SpendingType type, String parentGroup) {}
