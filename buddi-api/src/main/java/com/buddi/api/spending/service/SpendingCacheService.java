package com.buddi.api.spending.service;

import com.buddi.api.spending.dto.RoomSpendingListResponse;
import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.stereotype.Component;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.concurrent.TimeUnit;
import java.util.function.Function;
import java.util.function.Supplier;

@Component
public class SpendingCacheService {

    private final Cache<String, List<RoomSpendingListResponse>> monthlyCache = Caffeine.newBuilder()
            .expireAfterWrite(60, TimeUnit.SECONDS)
            .maximumSize(500)
            .build();

    private final Cache<String, Set<Long>> userLikesCache = Caffeine.newBuilder()
            .expireAfterWrite(60, TimeUnit.SECONDS)
            .maximumSize(1000)
            .build();

    private String monthKey(Long roomId, int year, int month) {
        return roomId + ":" + year + ":" + month;
    }

    private String likesKey(Long userId, Long roomId) {
        return userId + ":" + roomId;
    }

    public List<RoomSpendingListResponse> getMonthly(Long roomId, int year, int month,
            Function<String, List<RoomSpendingListResponse>> loader) {
        return monthlyCache.get(monthKey(roomId, year, month), loader);
    }

    public Set<Long> getUserLikes(Long userId, Long roomId, Supplier<List<Long>> loader) {
        return userLikesCache.get(likesKey(userId, roomId), k -> new HashSet<>(loader.get()));
    }

    public void evictMonthly(Long roomId, int year, int month) {
        monthlyCache.invalidate(monthKey(roomId, year, month));
    }

    public void addLike(Long userId, Long roomId, Long spendingId) {
        Set<Long> likes = userLikesCache.getIfPresent(likesKey(userId, roomId));
        if (likes != null) likes.add(spendingId);
    }

    public void removeLike(Long userId, Long roomId, Long spendingId) {
        Set<Long> likes = userLikesCache.getIfPresent(likesKey(userId, roomId));
        if (likes != null) likes.remove(spendingId);
    }
}
