package com.buddi.api.shareditem.notification.event;

import java.util.List;

public record SharedItemSharedEvent(Long sharedItemId, Long userId, long amount, String url, String title, String memo, List<Long> roomIds) {}
