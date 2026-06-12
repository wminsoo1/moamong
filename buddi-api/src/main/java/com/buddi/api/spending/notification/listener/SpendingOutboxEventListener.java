package com.buddi.api.spending.notification.listener;

import com.buddi.api.spending.notification.entity.SpendingOutbox;
import com.buddi.api.spending.notification.event.SpendingCreatedEvent;
import com.buddi.api.spending.notification.repository.SpendingOutboxRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Component
@RequiredArgsConstructor
public class SpendingOutboxEventListener {

    private final SpendingOutboxRepository spendingOutboxRepository;

    @TransactionalEventListener(phase = TransactionPhase.BEFORE_COMMIT)
    public void saveOutbox(SpendingCreatedEvent event) {
        spendingOutboxRepository.save(SpendingOutbox.of(
                event.spendingId(), event.userId(), event.amount(),
                event.categoryName(), event.memo()));
    }
}
