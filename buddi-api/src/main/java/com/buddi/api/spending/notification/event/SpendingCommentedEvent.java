package com.buddi.api.spending.notification.event;

public record SpendingCommentedEvent(Long spendingId, Long actorId, Long ownerId, String categoryName, String memo, long amount) {}
