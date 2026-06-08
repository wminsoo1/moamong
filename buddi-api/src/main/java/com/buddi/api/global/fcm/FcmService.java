package com.buddi.api.global.fcm;

import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.FirebaseMessagingException;
import com.google.firebase.messaging.Message;
import com.google.firebase.messaging.Notification;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class FcmService {

    public void sendHotItemNotification(String token, String senderNickname, long amount, String hotItemUrl, String hotItemMemo, String review) {
        String title = (hotItemMemo != null && !hotItemMemo.isBlank()) ? hotItemMemo.trim() : "핫템 공유";
        String body = senderNickname + "님 · " + String.format("%,d", amount) + "원"
                + ((review != null && !review.isBlank()) ? " · " + review.trim() : "");
        String url = hotItemUrl != null ? hotItemUrl : "/";

        Message message = Message.builder()
                .setToken(token)
                .setNotification(Notification.builder()
                        .setTitle(title)
                        .setBody(body)
                        .build())
                .putData("url", url)
                .build();
        try {
            String messageId = FirebaseMessaging.getInstance().send(message);
            log.info("FCM 전송 성공 (messageId: {})", messageId);
        } catch (FirebaseMessagingException e) {
            log.warn("FCM 전송 실패 (token: {}): {}", token, e.getMessage());
            throw new RuntimeException("FCM 전송 실패", e);
        }
    }
}
