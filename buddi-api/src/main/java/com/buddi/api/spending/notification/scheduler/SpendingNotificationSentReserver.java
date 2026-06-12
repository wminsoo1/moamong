package com.buddi.api.spending.notification.scheduler;

import com.buddi.api.spending.notification.repository.SpendingNotificationSentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Component
@RequiredArgsConstructor
public class SpendingNotificationSentReserver {

    private final SpendingNotificationSentRepository repository;

    @Transactional
    public List<Long> reserve() {
        var records = repository.findPendingWithSkipLock();
        records.forEach(r -> r.markProcessing());
        return records.stream().map(r -> r.getId()).toList();
    }
}
