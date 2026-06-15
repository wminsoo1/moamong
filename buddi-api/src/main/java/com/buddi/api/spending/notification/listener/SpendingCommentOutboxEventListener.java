package com.buddi.api.spending.notification.listener;

import com.buddi.api.spending.notification.entity.SpendingCommentOutbox;
import com.buddi.api.spending.notification.event.SpendingCommentedEvent;
import com.buddi.api.spending.notification.repository.SpendingCommentOutboxRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Component
@RequiredArgsConstructor
public class SpendingCommentOutboxEventListener {

    private final SpendingCommentOutboxRepository spendingCommentOutboxRepository;

    @TransactionalEventListener(phase = TransactionPhase.BEFORE_COMMIT)
    public void saveOutbox(SpendingCommentedEvent event) {
        spendingCommentOutboxRepository.save(SpendingCommentOutbox.of(
                event.spendingId(), event.actorId(), event.ownerId(), event.categoryName(), event.memo(), event.amount(), event.commentType(), event.commentContent()));
    }
}
