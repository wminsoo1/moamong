package com.buddi.api.spending.repository;

import com.buddi.api.spending.dto.CategoryAmountDto;
import com.buddi.api.spending.dto.WeeklyAmountDto;
import com.buddi.api.spending.entity.Spending;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface SpendingRepository extends JpaRepository<Spending, Long> {

    List<Spending> findByUserIdAndDateBetweenOrderByDateDesc(Long userId, LocalDate start, LocalDate end);

    boolean existsByUserId(Long userId);

    void deleteAllByUserId(Long userId);

    @Query("SELECT new com.buddi.api.spending.dto.WeeklyAmountDto(FLOOR((DAY(s.date) - 1) / 7) + 1, SUM(s.amount)) " +
           "FROM Spending s " +
           "WHERE s.userId = :userId AND s.date BETWEEN :start AND :end AND s.type = com.buddi.api.spending.entity.SpendingType.EXPENSE " +
           "GROUP BY FLOOR((DAY(s.date) - 1) / 7) + 1")
    List<WeeklyAmountDto> sumAmountByWeek(@Param("userId") Long userId,
                                          @Param("start") LocalDate start,
                                          @Param("end") LocalDate end);

    @Query("SELECT new com.buddi.api.spending.dto.CategoryAmountDto(s.categoryGroup, SUM(s.amount), COUNT(s)) " +
           "FROM Spending s " +
           "WHERE s.userId = :userId AND s.date BETWEEN :start AND :end AND s.type = com.buddi.api.spending.entity.SpendingType.EXPENSE " +
           "GROUP BY s.categoryGroup ORDER BY SUM(s.amount) DESC")
    List<CategoryAmountDto> sumAmountByCategory(@Param("userId") Long userId,
                                                @Param("start") LocalDate start,
                                                @Param("end") LocalDate end);
}
