package com.buddi.api.shareditem.scheduler;

import com.buddi.api.room.service.RoomQueryService;
import com.buddi.api.shareditem.notification.entity.NotificationSent;
import com.buddi.api.shareditem.notification.entity.SharedItemOutbox;
import com.buddi.api.shareditem.notification.repository.NotificationSentRepository;
import com.buddi.api.shareditem.notification.repository.SharedItemOutboxRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
public class SharedItemOutboxProcessor {

    private final SharedItemOutboxRepository sharedItemOutboxRepository;
    private final NotificationSentRepository notificationSentRepository;
    private final RoomQueryService roomQueryService;

    @Async("notificationExecutor")
    @Transactional
    public void process(Long outboxId) {
        SharedItemOutbox outbox = sharedItemOutboxRepository.findById(outboxId).orElse(null);
        if (outbox == null) return;

        for (Long roomId : outbox.getRoomIdList()) {
            if (roomQueryService.isSystemRoom(roomId)) continue;
            for (Long receiverId : roomQueryService.getRoomMemberIds(roomId, outbox.getSenderId())) {
                if (!notificationSentRepository.existsByOutboxIdAndReceiverId(outboxId, receiverId)) {
                    notificationSentRepository.save(NotificationSent.of(
                            outboxId, outbox.getSenderId(), receiverId,
                            outbox.getAmount(), outbox.getUrl(), outbox.getTitle(), outbox.getMemo()));
                }
            }
        }
        outbox.markProcessed();
    }
}
