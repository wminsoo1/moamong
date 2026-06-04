package com.buddi.api.shareditem.notification.scheduler;

import com.buddi.api.global.fcm.FcmService;
import com.buddi.api.shareditem.notification.entity.NotificationSent;
import com.buddi.api.shareditem.notification.repository.NotificationSentRepository;
import com.buddi.api.user.service.UserQueryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Component
@RequiredArgsConstructor
public class NotificationSentProcessor {

    private final NotificationSentRepository notificationSentRepository;
    private final UserQueryService userQueryService;
    private final FcmService fcmService;

    @Async("notificationExecutor")
    @Transactional
    public void process(Long sentId) {
        NotificationSent sent = notificationSentRepository.findById(sentId).orElse(null);
        if (sent == null) return;

        com.buddi.api.user.entity.User receiver = userQueryService.findById(sent.getReceiverId());
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

        String senderNickname = userQueryService.findById(sent.getSenderId()).getNickname();
        fcmService.sendHotItemNotification(token, senderNickname, sent.getAmount(), sent.getUrl(), sent.getTitle());
        sent.markProcessed();
    }
}
