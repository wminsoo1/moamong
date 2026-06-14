package com.buddi.api.spending.service;

import com.buddi.api.global.s3.PresignedUrlService;
import com.buddi.api.room.service.RoomQueryService;
import com.buddi.api.spending.dto.SpendingCommentRequest;
import com.buddi.api.spending.dto.SpendingCommentResponse;
import com.buddi.api.spending.entity.Spending;
import com.buddi.api.spending.entity.SpendingComment;
import com.buddi.api.spending.notification.event.SpendingCommentedEvent;
import com.buddi.api.spending.repository.SpendingRepository;
import com.buddi.api.user.entity.User;
import com.buddi.api.user.service.UserQueryService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.ZoneOffset;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SpendingCommentService {

    private final SpendingRepository spendingRepository;
    private final RoomQueryService roomQueryService;
    private final UserQueryService userQueryService;
    private final PresignedUrlService presignedUrlService;
    private final ApplicationEventPublisher eventPublisher;

    @Transactional(readOnly = true)
    public List<SpendingCommentResponse> getComments(Long roomId, Long spendingId) {
        Spending spending = spendingRepository.findByIdWithComments(spendingId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "지출이 없습니다"));

        List<SpendingComment> comments = spending.getComments().stream()
                .filter(c -> roomId.equals(c.getRoomId()))
                .toList();
        if (comments.isEmpty()) return List.of();

        List<Long> userIds = comments.stream().map(SpendingComment::getUserId).distinct().toList();
        Map<Long, String> usernameMap = userQueryService.findAllByIds(userIds).stream()
                .collect(Collectors.toMap(User::getId, User::getUsername));

        return comments.stream().map(c -> new SpendingCommentResponse(
                c.getId(),
                c.getUserId(),
                usernameMap.getOrDefault(c.getUserId(), "알 수 없음"),
                c.getType(),
                c.getContent(),
                c.getAudioUrl(),
                c.getCreatedAt().atOffset(ZoneOffset.UTC)
        )).toList();
    }

    @Transactional
    public SpendingCommentResponse addComment(Long roomId, Long spendingId, Long userId, SpendingCommentRequest request) {
        roomQueryService.validateMember(roomId, userId);
        Spending spending = spendingRepository.findById(spendingId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "지출이 없습니다"));

        SpendingComment comment;
        if ("VOICE".equals(request.getEffectiveType())) {
            if (request.getAudioUrl() == null || request.getAudioUrl().isBlank()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "오디오 URL을 입력해주세요");
            }
            comment = spending.addVoiceComment(roomId, userId, request.getAudioUrl());
        } else {
            if (request.getContent() == null || request.getContent().isBlank()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "댓글 내용을 입력해주세요");
            }
            comment = spending.addComment(roomId, userId, request.getContent());
        }
        spendingRepository.saveAndFlush(spending);

        if (!userId.equals(spending.getUserId())) {
            eventPublisher.publishEvent(new SpendingCommentedEvent(
                    spendingId, userId, spending.getUserId(), spending.getCategoryName(), spending.getMemo(), spending.getAmount()));
        }

        String username = userQueryService.findById(userId).getUsername();
        return new SpendingCommentResponse(
                comment.getId(),
                userId,
                username,
                comment.getType(),
                comment.getContent(),
                comment.getAudioUrl(),
                comment.getCreatedAt().atOffset(ZoneOffset.UTC)
        );
    }

    @Transactional
    public void deleteCommentLegacy(Long spendingId, Long commentId, Long userId) {
        Spending spending = spendingRepository.findByIdWithComments(spendingId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "지출이 없습니다"));
        SpendingComment comment = spending.getComments().stream()
                .filter(c -> c.getId().equals(commentId))
                .findFirst()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "댓글이 없습니다"));
        comment.validateOwner(userId);
        if ("VOICE".equals(comment.getType())) {
            presignedUrlService.deleteByUrl(comment.getAudioUrl());
        }
        spending.getComments().remove(comment);
        spendingRepository.save(spending);
    }

    @Transactional
    public void deleteComment(Long roomId, Long spendingId, Long commentId, Long userId) {
        roomQueryService.validateMember(roomId, userId);
        Spending spending = spendingRepository.findByIdWithComments(spendingId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "지출이 없습니다"));
        SpendingComment comment = spending.getComments().stream()
                .filter(c -> c.getId().equals(commentId) && roomId.equals(c.getRoomId()))
                .findFirst()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "댓글이 없습니다"));
        comment.validateOwner(userId);
        if ("VOICE".equals(comment.getType())) {
            presignedUrlService.deleteByUrl(comment.getAudioUrl());
        }
        spending.getComments().remove(comment);
        spendingRepository.save(spending);
    }
}
