package com.buddi.api.shareditem.service;

import com.buddi.api.shareditem.dto.FeedPageResponse;
import com.buddi.api.shareditem.dto.ReactionSummary;
import java.time.ZoneOffset;
import com.buddi.api.shareditem.dto.SharedItemCommentResponse;
import com.buddi.api.shareditem.dto.SharedItemFeedResponse;
import com.buddi.api.shareditem.entity.SharedItem;
import com.buddi.api.shareditem.entity.SharedItemReaction;
import com.buddi.api.room.service.RoomQueryService;
import com.buddi.api.shareditem.repository.SharedItemRepository;
import com.buddi.api.user.entity.User;
import com.buddi.api.user.service.UserQueryService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SharedItemQueryService {

    private final SharedItemRepository sharedItemRepository;
    private final UserQueryService userQueryService;
    private final RoomQueryService roomQueryService;
    private final FeedCacheService feedCacheService;

    @Transactional(readOnly = true)
    public FeedPageResponse getSharedItemFeed(Long userId, Long roomId, Long cursor, int size) {
        roomQueryService.validateMember(roomId, userId);

        FeedPageResponse baseFeed;
        if (cursor == null) {
            baseFeed = feedCacheService.getFeed(roomId, k -> fetchFeed(k, null, size));
        } else {
            baseFeed = fetchFeed(roomId, cursor, size);
        }

        Set<String> myReactions = feedCacheService.getReactions(userId,
                k -> sharedItemRepository.findReactionsByUserId(userId).stream()
                        .map(r -> r.getSharedItem().getId() + "_" + r.getEmoji())
                        .collect(Collectors.toSet()));

        return applyReacted(baseFeed, myReactions);
    }

    private FeedPageResponse fetchFeed(Long roomId, Long cursor, int size) {
        PageRequest pageable = PageRequest.of(0, size + 1);

        List<SharedItem> items = sharedItemRepository.findFeedByRoomId(roomId, pageable);
        if (cursor != null) {
            items = sharedItemRepository.findFeedByRoomIdWithCursor(roomId, cursor, pageable);
        }

        boolean hasNext = items.size() > size;
        List<SharedItem> content = items;
        if (hasNext) {
            content = items.subList(0, size);
        }

        if (content.isEmpty()) return new FeedPageResponse(List.of(), false, null);

        List<Long> userIds = content.stream().map(SharedItem::getUserId).distinct().toList();
        Map<Long, User> userMap = userQueryService.findAllByIds(userIds)
                .stream().collect(Collectors.toMap(User::getId, u -> u));

        List<SharedItemFeedResponse> responses = content.stream()
                .map(si -> toResponse(si, userMap))
                .toList();

        Long nextCursor = null;
        if (hasNext) {
            nextCursor = content.get(content.size() - 1).getId();
        }
        return new FeedPageResponse(responses, hasNext, nextCursor);
    }

    private FeedPageResponse applyReacted(FeedPageResponse feed, Set<String> myReactions) {
        List<SharedItemFeedResponse> updated = feed.content().stream()
                .map(item -> new SharedItemFeedResponse(
                        item.sharedItemId(), item.userId(), item.shareGroupId(),
                        item.senderUsername(), item.amount(), item.url(), item.title(),
                        item.imageUrl(), item.review(), item.category(), item.createdAt(),
                        item.reactions().stream()
                                .map(r -> new ReactionSummary(r.emoji(), r.count(),
                                        myReactions.contains(item.sharedItemId() + "_" + r.emoji())))
                                .toList(),
                        item.commentCount(), item.viewCount()
                ))
                .toList();
        return new FeedPageResponse(updated, feed.hasNext(), feed.nextCursor());
    }

    private SharedItemFeedResponse toResponse(SharedItem si, Map<Long, User> userMap) {
        String senderUsername = "알 수 없음";
        User sender = userMap.get(si.getUserId());
        if (sender != null) {
            senderUsername = sender.getUsername();
        }
        return new SharedItemFeedResponse(
                si.getId(),
                si.getUserId(),
                si.getShareGroupId(),
                senderUsername,
                si.getAmount(),
                si.getUrl(),
                si.getTitle(),
                si.getImageUrl(),
                si.getMemo(),
                si.getCategory().name(),
                si.getCreatedAt().atOffset(ZoneOffset.UTC).withOffsetSameInstant(ZoneOffset.ofHours(9)),
                buildReactionSummaries(si.getReactions()),
                si.getComments().size(),
                si.getViewCount()
        );
    }

    private List<ReactionSummary> buildReactionSummaries(List<SharedItemReaction> reactions) {
        if (reactions.isEmpty()) return List.of();
        Map<String, Long> counts = reactions.stream()
                .collect(Collectors.groupingBy(SharedItemReaction::getEmoji, Collectors.counting()));
        return counts.entrySet().stream()
                .map(e -> new ReactionSummary(e.getKey(), e.getValue().intValue(), false))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<SharedItemCommentResponse> getComments(Long sharedItemId, Long userId) {
        SharedItem item = sharedItemRepository.findByIdWithComments(sharedItemId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        boolean isMember = item.getRoomShares().stream()
                .anyMatch(rs -> roomQueryService.isMember(rs.getRoomId(), userId));
        if (!isMember) throw new ResponseStatusException(HttpStatus.FORBIDDEN, "방 멤버가 아닙니다");
        return item.getComments().stream()
                .map(c -> new SharedItemCommentResponse(
                        c.getId(),
                        c.getUserId(),
                        userQueryService.findById(c.getUserId()).getUsername(),
                        c.getContent(),
                        c.getCreatedAt().atOffset(ZoneOffset.UTC).withOffsetSameInstant(ZoneOffset.ofHours(9))))
                .toList();
    }
}
