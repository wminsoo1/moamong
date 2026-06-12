package com.buddi.api.spending.service;

import com.buddi.api.room.service.RoomQueryService;
import com.buddi.api.spending.dto.SpendingCommentRequest;
import com.buddi.api.spending.dto.SpendingCommentResponse;
import com.buddi.api.spending.entity.Spending;
import com.buddi.api.spending.entity.SpendingComment;
import com.buddi.api.spending.repository.SpendingRepository;
import com.buddi.api.user.entity.User;
import com.buddi.api.user.service.UserQueryService;
import lombok.RequiredArgsConstructor;
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

    @Transactional(readOnly = true)
    public List<SpendingCommentResponse> getComments(Long spendingId) {
        Spending spending = spendingRepository.findByIdWithComments(spendingId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "지출이 없습니다"));

        List<SpendingComment> comments = spending.getComments();
        if (comments.isEmpty()) return List.of();

        List<Long> userIds = comments.stream().map(SpendingComment::getUserId).distinct().toList();
        Map<Long, String> usernameMap = userQueryService.findAllByIds(userIds).stream()
                .collect(Collectors.toMap(User::getId, User::getUsername));

        return comments.stream().map(c -> new SpendingCommentResponse(
                c.getId(),
                c.getUserId(),
                usernameMap.getOrDefault(c.getUserId(), "알 수 없음"),
                c.getContent(),
                c.getCreatedAt().atOffset(ZoneOffset.UTC)
        )).toList();
    }

    @Transactional
    public SpendingCommentResponse addComment(Long roomId, Long spendingId, Long userId, SpendingCommentRequest request) {
        roomQueryService.validateMember(roomId, userId);
        Spending spending = spendingRepository.findById(spendingId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "지출이 없습니다"));
        SpendingComment comment = spending.addComment(userId, request.getContent());
        spendingRepository.saveAndFlush(spending);

        String username = userQueryService.findById(userId).getUsername();
        return new SpendingCommentResponse(
                comment.getId(),
                userId,
                username,
                comment.getContent(),
                comment.getCreatedAt().atOffset(ZoneOffset.UTC)
        );
    }

    @Transactional
    public void deleteComment(Long spendingId, Long commentId, Long userId) {
        Spending spending = spendingRepository.findByIdWithComments(spendingId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "지출이 없습니다"));
        spending.removeComment(commentId, userId);
        spendingRepository.save(spending);
    }

}
