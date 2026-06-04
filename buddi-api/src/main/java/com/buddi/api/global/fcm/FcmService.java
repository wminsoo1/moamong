package com.buddi.api.global.fcm;

import com.google.firebase.FirebaseApp;
import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.FirebaseMessagingException;
import com.google.firebase.messaging.Message;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class FcmService {

    public void sendHotItemNotification(String token, String senderNickname, long amount, String hotItemUrl, String hotItemMemo) {
        String title = "🔥 핫템 알림";
        String body = senderNickname + "님이 " + String.format("%,d", amount) + "원 핫템을 구매했어요!"
                + ((hotItemMemo != null && !hotItemMemo.isBlank()) ? " - " + hotItemMemo.trim() : "");
        String url = hotItemUrl != null ? hotItemUrl : "/";

        Message message = Message.builder()
                .setToken(token)
                .putData("title", title)
                .putData("body", body)
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
