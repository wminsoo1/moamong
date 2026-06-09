package com.buddi.api.shareditem.service;

import com.buddi.api.shareditem.dto.FeedPageResponse;
import com.buddi.api.shareditem.dto.ReactionSummary;
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

    @Transactional(readOnly = true)
    public FeedPageResponse getSharedItemFeed(Long userId, Long roomId, Long cursor, int size) {
        roomQueryService.validateMember(roomId, userId);
        PageRequest pageable = PageRequest.of(0, size + 1);
        List<SharedItem> items = cursor == null
                ? sharedItemRepository.findFeedByRoomId(roomId, pageable)
                : sharedItemRepository.findFeedByRoomIdWithCursor(roomId, cursor, pageable);

        boolean hasNext = items.size() > size;
        List<SharedItem> content = hasNext ? items.subList(0, size) : items;

        if (content.isEmpty()) return new FeedPageResponse(List.of(), false, null);

        List<Long> userIds = content.stream().map(SharedItem::getUserId).distinct().toList();
        Map<Long, User> userMap = userQueryService.findAllByIds(userIds)
                .stream().collect(Collectors.toMap(User::getId, u -> u));

        List<SharedItemFeedResponse> responses = content.stream()
                .map(si -> toResponse(userId, si, userMap))
                .toList();

        Long nextCursor = hasNext ? content.get(content.size() - 1).getId() : null;
        return new FeedPageResponse(responses, hasNext, nextCursor);
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
                        c.getCreatedAt()))
                .toList();
    }

    private SharedItemFeedResponse toResponse(Long userId, SharedItem si, Map<Long, User> userMap) {
        User sender = userMap.get(si.getUserId());
        String senderUsername = sender != null ? sender.getUsername() : "알 수 없음";
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
                si.getCreatedAt(),
                buildReactionSummaries(userId, si.getReactions()),
                si.getComments().size(),
                si.getViewCount()
        );
    }

    private List<ReactionSummary> buildReactionSummaries(Long userId, List<SharedItemReaction> reactions) {
        if (reactions.isEmpty()) return List.of();
        Map<String, Long> counts = reactions.stream()
                .collect(Collectors.groupingBy(SharedItemReaction::getEmoji, Collectors.counting()));
        Set<String> mine = reactions.stream()
                .filter(r -> r.getUserId().equals(userId))
                .map(SharedItemReaction::getEmoji)
                .collect(Collectors.toSet());
        return counts.entrySet().stream()
                .map(e -> new ReactionSummary(e.getKey(), e.getValue().intValue(), mine.contains(e.getKey())))
                .toList();
    }
}
