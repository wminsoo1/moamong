package com.buddi.api.spending.notification.event;

public record SpendingCreatedEvent(Long spendingId, Long userId, long amount, String categoryName, String memo) {
}
