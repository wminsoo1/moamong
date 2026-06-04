package com.buddi.api.shareditem.service;

import com.buddi.api.shareditem.notification.event.SharedItemSharedEvent;
import com.buddi.api.room.service.RoomQueryService;
import com.buddi.api.shareditem.dto.ReactionSummary;
import com.buddi.api.shareditem.dto.SharedItemCommentResponse;
import com.buddi.api.shareditem.dto.SharedItemResponse;
import com.buddi.api.shareditem.entity.SharedItem;
import com.buddi.api.shareditem.entity.SharedItemCategory;
import com.buddi.api.shareditem.repository.SharedItemRepository;
import com.buddi.api.user.service.UserQueryService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
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
public class SharedItemCommandService {

    private final SharedItemRepository sharedItemRepository;
    private final RoomQueryService roomQueryService;
    private final UserQueryService userQueryService;
    private final ApplicationEventPublisher eventPublisher;

    @Transactional
    public List<SharedItemResponse> createFromSpending(Long userId, Long spendingId, Long amount,
                                                        String url, String title, String imageUrl,
                                                        String memo, SharedItemCategory category,
                                                        List<Long> roomIds, boolean isPublic) {
        if (roomIds == null || roomIds.isEmpty()) throw new IllegalArgumentException("공유할 방을 선택해주세요");
        roomIds.forEach(roomId -> roomQueryService.validateMember(roomId, userId));

        return roomIds.stream().map(roomId -> {
            SharedItem item = SharedItem.of(userId, title, url, imageUrl, memo, category, spendingId, amount, isPublic);
            sharedItemRepository.save(item);
            item.shareToRoom(roomId);
            eventPublisher.publishEvent(new SharedItemSharedEvent(
                    item.getId(), userId, amount, url, title, List.of(roomId)));
            return new SharedItemResponse(item);
        }).toList();
    }

    @Transactional
    public List<ReactionSummary> toggleReaction(Long userId, Long sharedItemId, String emoji) {
        SharedItem item = sharedItemRepository.findById(sharedItemId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "공유 아이템이 존재하지 않습니다"));
        item.toggleReaction(userId, emoji);
        return buildReactionSummaries(userId, item);
    }

    @Transactional
    public SharedItemCommentResponse addComment(Long userId, Long sharedItemId, String content) {
        SharedItem item = sharedItemRepository.findById(sharedItemId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "공유 아이템이 존재하지 않습니다"));
        var comment = item.addComment(userId, content);
        return new SharedItemCommentResponse(comment.getId(),
                userQueryService.findById(userId).getNickname(),
                comment.getContent(), comment.getCreatedAt());
    }

    @Transactional
    public void recordView(Long sharedItemId) {
        SharedItem item = sharedItemRepository.findById(sharedItemId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "공유 아이템이 존재하지 않습니다"));
        item.incrementViewCount();
    }

    private List<ReactionSummary> buildReactionSummaries(Long userId, SharedItem item) {
        var reactions = item.getReactions();
        if (reactions.isEmpty()) return List.of();
        Map<String, Long> counts = reactions.stream()
                .collect(Collectors.groupingBy(r -> r.getEmoji(), Collectors.counting()));
        Set<String> mine = reactions.stream()
                .filter(r -> r.getUserId().equals(userId))
                .map(r -> r.getEmoji())
                .collect(Collectors.toSet());
        return counts.entrySet().stream()
                .map(e -> new ReactionSummary(e.getKey(), e.getValue().intValue(), mine.contains(e.getKey())))
                .toList();
    }
}
