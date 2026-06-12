package com.buddi.api.spending.notification.scheduler;

import com.buddi.api.room.service.RoomNotificationService;
import com.buddi.api.room.service.RoomQueryService;
import com.buddi.api.spending.notification.entity.SpendingNotificationSent;
import com.buddi.api.spending.notification.entity.SpendingOutbox;
import com.buddi.api.spending.notification.repository.SpendingNotificationSentRepository;
import com.buddi.api.spending.notification.repository.SpendingOutboxRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
public class SpendingOutboxProcessor {

    private final SpendingOutboxRepository spendingOutboxRepository;
    private final SpendingNotificationSentRepository spendingNotificationSentRepository;
    private final RoomQueryService roomQueryService;
    private final RoomNotificationService roomNotificationService;

    @Async("notificationExecutor")
    @Transactional
    public void process(Long outboxId) {
        SpendingOutbox outbox = spendingOutboxRepository.findById(outboxId).orElse(null);
        if (outbox == null) return;

        for (Long roomId : roomQueryService.getRoomIds(outbox.getSenderId())) {
            if (roomQueryService.isSystemRoom(roomId)) continue;
            for (Long receiverId : roomQueryService.getRoomMemberIds(roomId, outbox.getSenderId())) {
                if (!roomNotificationService.isEnabled(receiverId, roomId)) continue;
                if (!spendingNotificationSentRepository.existsByOutboxIdAndReceiverId(outboxId, receiverId)) {
                    spendingNotificationSentRepository.save(SpendingNotificationSent.of(
                            outboxId, outbox.getSenderId(), receiverId,
                            outbox.getAmount(), outbox.getCategoryName(), outbox.getMemo()));
                }
            }
        }
        outbox.markProcessed();
    }
}
