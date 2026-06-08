package com.buddi.api.spending.repository;

import com.buddi.api.spending.entity.RecurringSpending;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface RecurringSpendingRepository extends JpaRepository<RecurringSpending, Long> {

    List<RecurringSpending> findByUserIdOrderByDayOfMonth(Long userId);

    void deleteAllByUserId(Long userId);

    @Query("SELECT r FROM RecurringSpending r WHERE r.userId = :userId " +
           "AND r.startDate <= :monthEnd " +
           "AND (r.endDate IS NULL OR r.endDate >= :monthStart)")
    List<RecurringSpending> findActiveInMonth(@Param("userId") Long userId,
                                              @Param("monthStart") LocalDate monthStart,
                                              @Param("monthEnd") LocalDate monthEnd);
}
