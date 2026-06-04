package com.buddi.api.shareditem.notification.scheduler;

import com.buddi.api.shareditem.notification.repository.NotificationSentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Component
@RequiredArgsConstructor
public class NotificationSentReserver {

    private final NotificationSentRepository repository;

    @Transactional
    public List<Long> reserve() {
        var records = repository.findPendingWithSkipLock();
        records.forEach(r -> r.markProcessing());
        return records.stream().map(r -> r.getId()).toList();
    }
}
