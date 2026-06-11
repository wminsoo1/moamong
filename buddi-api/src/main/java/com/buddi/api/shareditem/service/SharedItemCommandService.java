package com.buddi.api.shareditem.service;

import com.buddi.api.shareditem.notification.event.SharedItemSharedEvent;
import com.buddi.api.room.service.RoomQueryService;
import java.time.ZoneOffset;
import com.buddi.api.shareditem.dto.ReactionSummary;
import com.buddi.api.shareditem.dto.SharedItemCommentResponse;
import com.buddi.api.shareditem.dto.SharedItemResponse;
import com.buddi.api.shareditem.entity.SharedItem;
import com.buddi.api.shareditem.entity.SharedItemCategory;
import com.buddi.api.shareditem.repository.SharedItemCommentRepository;
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
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SharedItemCommandService {

    private final SharedItemRepository sharedItemRepository;
    private final SharedItemCommentRepository commentRepository;
    private final RoomQueryService roomQueryService;
    private final UserQueryService userQueryService;
    private final ApplicationEventPublisher eventPublisher;

    @Transactional
    public List<SharedItemResponse> create(Long userId, String url, String title, String imageUrl,
                                            String review, SharedItemCategory category, Long amount,
                                            List<Long> roomIds, boolean isPublic) {
        if (roomIds == null || roomIds.isEmpty()) throw new IllegalArgumentException("공유할 방을 선택해주세요");
        roomIds.forEach(roomId -> roomQueryService.validateMember(roomId, userId));

        String shareGroupId = UUID.randomUUID().toString();
        return roomIds.stream().map(roomId -> {
            SharedItem item = SharedItem.of(userId, title, url, imageUrl, review, category, null, amount, isPublic, shareGroupId);
            sharedItemRepository.save(item);
            item.shareToRoom(roomId);
            eventPublisher.publishEvent(new SharedItemSharedEvent(
                    item.getId(), userId, amount, url, title, review, List.of(roomId)));
            return new SharedItemResponse(item);
        }).toList();
    }

    @Transactional
    public List<SharedItemResponse> createFromSpending(Long userId, Long spendingId, Long amount,
                                                        String url, String title, String imageUrl,
                                                        String memo, SharedItemCategory category,
                                                        List<Long> roomIds, boolean isPublic) {
        if (roomIds == null || roomIds.isEmpty()) throw new IllegalArgumentException("공유할 방을 선택해주세요");
        roomIds.forEach(roomId -> roomQueryService.validateMember(roomId, userId));

        String shareGroupId = UUID.randomUUID().toString();
        return roomIds.stream().map(roomId -> {
            SharedItem item = SharedItem.of(userId, title, url, imageUrl, memo, category, spendingId, amount, isPublic, shareGroupId);
            sharedItemRepository.save(item);
            item.shareToRoom(roomId);
            eventPublisher.publishEvent(new SharedItemSharedEvent(
                    item.getId(), userId, amount, url, title, memo, List.of(roomId)));
            return new SharedItemResponse(item);
        }).toList();
    }

    @Transactional
    public List<ReactionSummary> toggleReaction(Long userId, Long sharedItemId, String emoji) {
        SharedItem item = sharedItemRepository.findById(sharedItemId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "공유 아이템이 존재하지 않습니다"));
        validateItemAccess(userId, item);
        item.toggleReaction(userId, emoji);
        return buildReactionSummaries(userId, item);
    }

    @Transactional
    public SharedItemCommentResponse addComment(Long userId, Long sharedItemId, String content) {
        SharedItem item = sharedItemRepository.findById(sharedItemId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "공유 아이템이 존재하지 않습니다"));
        validateItemAccess(userId, item);
        var comment = item.addComment(userId, content);
        return new SharedItemCommentResponse(comment.getId(),
                userId,
                userQueryService.findById(userId).getUsername(),
                comment.getContent(), comment.getCreatedAt().atOffset(ZoneOffset.ofHours(9)));
    }

    @Transactional
    public void delete(Long sharedItemId, Long userId) {
        SharedItem item = sharedItemRepository.findById(sharedItemId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "공유 아이템이 존재하지 않습니다"));
        if (!item.getUserId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "본인이 공유한 항목만 삭제할 수 있습니다");
        }
        sharedItemRepository.deleteByShareGroupId(item.getShareGroupId());
    }

    @Transactional
    public void update(Long sharedItemId, Long userId, String title, String url, String imageUrl,
                       String memo, SharedItemCategory category, Long amount) {
        SharedItem item = sharedItemRepository.findById(sharedItemId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "공유 아이템이 존재하지 않습니다"));
        if (!item.getUserId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "본인이 공유한 항목만 수정할 수 있습니다");
        }
        sharedItemRepository.findByShareGroupId(item.getShareGroupId())
                .forEach(si -> si.update(title, url, imageUrl, memo, category, amount));
    }

    @Transactional
    public void deleteComment(Long commentId, Long userId) {
        var comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "댓글이 존재하지 않습니다"));
        if (!comment.getUserId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "본인 댓글만 삭제할 수 있습니다");
        }
        commentRepository.delete(comment);
    }

    @Transactional
    public void recordView(Long sharedItemId) {
        SharedItem item = sharedItemRepository.findById(sharedItemId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "공유 아이템이 존재하지 않습니다"));
        item.incrementViewCount();
    }

    private void validateItemAccess(Long userId, SharedItem item) {
        boolean isMember = item.getRoomShares().stream()
                .anyMatch(rs -> roomQueryService.isMember(rs.getRoomId(), userId));
        if (!isMember) throw new ResponseStatusException(HttpStatus.FORBIDDEN, "방 멤버가 아닙니다");
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
