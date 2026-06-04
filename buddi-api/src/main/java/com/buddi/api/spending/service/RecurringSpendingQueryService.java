package com.buddi.api.spending.service;

import com.buddi.api.spending.dto.RecurringSpendingResponse;
import com.buddi.api.spending.repository.RecurringSpendingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RecurringSpendingQueryService {

    private final RecurringSpendingRepository recurringSpendingRepository;

    @Transactional(readOnly = true)
    public List<RecurringSpendingResponse> list(Long userId) {
        return recurringSpendingRepository.findByUserIdOrderByDayOfMonth(userId)
                .stream().map(RecurringSpendingResponse::new).toList();
    }

    @Transactional(readOnly = true)
    public List<RecurringSpendingResponse> listActiveInMonth(Long userId, int year, int month) {
        LocalDate start = LocalDate.of(year, month, 1);
        LocalDate end = start.withDayOfMonth(start.lengthOfMonth());
        return recurringSpendingRepository.findActiveInMonth(userId, start, end)
                .stream().map(RecurringSpendingResponse::new).toList();
    }
}
