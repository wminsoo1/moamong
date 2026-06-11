package com.buddi.api.shareditem.service;

import com.buddi.api.shareditem.dto.FeedPageResponse;
import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.stereotype.Component;

import java.util.Set;
import java.util.concurrent.TimeUnit;
import java.util.function.Function;

@Component
public class FeedCacheService {

    private final Cache<Long, FeedPageResponse> feedCache = Caffeine.newBuilder()
            .expireAfterWrite(60, TimeUnit.SECONDS)
            .maximumSize(500)
            .build();

    private final Cache<Long, Set<String>> reactionCache = Caffeine.newBuilder()
            .expireAfterWrite(60, TimeUnit.SECONDS)
            .maximumSize(1000)
            .build();

    public FeedPageResponse getFeed(Long roomId, Function<Long, FeedPageResponse> loader) {
        return feedCache.get(roomId, loader);
    }

    public Set<String> getReactions(Long userId, Function<Long, Set<String>> loader) {
        return reactionCache.get(userId, loader);
    }

    public void evictFeed(Long roomId) {
        feedCache.invalidate(roomId);
    }

    public void addReaction(Long userId, String key) {
        Set<String> reactions = reactionCache.getIfPresent(userId);
        if (reactions != null) {
            reactions.add(key);
        }
    }

    public void removeReaction(Long userId, String key) {
        Set<String> reactions = reactionCache.getIfPresent(userId);
        if (reactions != null) {
            reactions.remove(key);
        }
    }
}
