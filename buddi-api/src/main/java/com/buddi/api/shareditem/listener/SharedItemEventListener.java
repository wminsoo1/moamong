package com.buddi.api.shareditem.listener;

import com.buddi.api.shareditem.notification.entity.SharedItemOutbox;
import com.buddi.api.shareditem.notification.event.SharedItemSharedEvent;
import com.buddi.api.shareditem.notification.repository.SharedItemOutboxRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Component
@RequiredArgsConstructor
public class SharedItemEventListener {

    private final SharedItemOutboxRepository sharedItemOutboxRepository;

    @TransactionalEventListener(phase = TransactionPhase.BEFORE_COMMIT)
    public void saveOutbox(SharedItemSharedEvent event) {
        sharedItemOutboxRepository.save(SharedItemOutbox.of(
                event.sharedItemId(), event.userId(), event.amount(),
                event.url(), event.title(), event.memo(), event.roomIds()));
    }
}
