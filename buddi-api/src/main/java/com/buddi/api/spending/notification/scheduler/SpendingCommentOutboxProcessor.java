package com.buddi.api.spending.notification.scheduler;

import com.buddi.api.global.fcm.FcmService;
import com.buddi.api.spending.notification.entity.SpendingCommentOutbox;
import com.buddi.api.spending.notification.repository.SpendingCommentOutboxRepository;
import com.buddi.api.user.entity.User;
import com.buddi.api.user.service.UserQueryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Component
@RequiredArgsConstructor
public class SpendingCommentOutboxProcessor {

    private final SpendingCommentOutboxRepository spendingCommentOutboxRepository;
    private final UserQueryService userQueryService;
    private final FcmService fcmService;

    @Async("notificationExecutor")
    @Transactional
    public void process(Long outboxId) {
        SpendingCommentOutbox outbox = spendingCommentOutboxRepository.findById(outboxId).orElse(null);
        if (outbox == null) return;

        User receiver = userQueryService.findById(outbox.getOwnerId());
        if (!receiver.isNotificationEnabled()) {
            log.info("알림 비활성화 - 댓글 알림 스킵 (outboxId: {}, ownerId: {})", outboxId, outbox.getOwnerId());
            outbox.markProcessed();
            return;
        }

        String token = receiver.getFcmToken();
        if (token == null) {
            log.warn("FCM 토큰 없음 - 댓글 알림 스킵 (outboxId: {}, ownerId: {})", outboxId, outbox.getOwnerId());
            outbox.markProcessed();
            return;
        }

        User actor = userQueryService.findById(outbox.getActorId());
        if (actor.isDeleted()) {
            log.info("댓글 작성자 탈퇴 - 댓글 알림 스킵 (outboxId: {}, actorId: {})", outboxId, outbox.getActorId());
            outbox.markProcessed();
            return;
        }

        fcmService.sendCommentNotification(token, actor.getUsername(), outbox.getCategoryName(), outbox.getMemo(), outbox.getAmount());
        outbox.markProcessed();
    }
}
