package com.buddi.api.spending.notification.scheduler;

import com.buddi.api.global.fcm.FcmService;
import com.buddi.api.spending.notification.entity.SpendingNotificationSent;
import com.buddi.api.spending.notification.repository.SpendingNotificationSentRepository;
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
public class SpendingNotificationSentProcessor {

    private final SpendingNotificationSentRepository spendingNotificationSentRepository;
    private final UserQueryService userQueryService;
    private final FcmService fcmService;

    @Async("notificationExecutor")
    @Transactional
    public void process(Long sentId) {
        SpendingNotificationSent sent = spendingNotificationSentRepository.findById(sentId).orElse(null);
        if (sent == null) return;

        User receiver = userQueryService.findById(sent.getReceiverId());
        if (!receiver.isNotificationEnabled()) {
            log.info("알림 비활성화 상태 - 알림 스킵 (sentId: {}, receiverId: {})", sentId, sent.getReceiverId());
            sent.markProcessed();
            return;
        }

        String token = receiver.getFcmToken();
        if (token == null) {
            log.warn("FCM 토큰 없음 - 알림 스킵 (sentId: {}, receiverId: {})", sentId, sent.getReceiverId());
            sent.markProcessed();
            return;
        }

        User sender = userQueryService.findById(sent.getSenderId());
        if (sender.isDeleted()) {
            log.info("발신자 탈퇴 - 알림 스킵 (sentId: {}, senderId: {})", sentId, sent.getSenderId());
            sent.markProcessed();
            return;
        }
        fcmService.sendSpendingNotification(token, sender.getUsername(), sent.getAmount(), sent.getCategoryName(), sent.getMemo(), sent.getSpendingId(), sent.getRoomId(), sent.getRoomName());
        sent.markProcessed();
    }
}
