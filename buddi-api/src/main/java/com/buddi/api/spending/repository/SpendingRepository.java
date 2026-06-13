package com.buddi.api.spending.repository;

import com.buddi.api.spending.dto.CategoryAmountDto;
import com.buddi.api.spending.dto.WeeklyAmountDto;
import com.buddi.api.spending.entity.Spending;
import com.buddi.api.spending.entity.SpendingComment;
import com.buddi.api.spending.entity.SpendingLike;
import com.buddi.api.spending.entity.SpendingType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface SpendingRepository extends JpaRepository<Spending, Long> {

    List<Spending> findByUserIdAndDateBetweenOrderByDateDesc(Long userId, LocalDate start, LocalDate end);

    boolean existsByUserId(Long userId);

    void deleteAllByUserId(Long userId);

    Optional<Spending> findTopByUserIdInAndTypeOrderByCreatedAtDesc(List<Long> userIds, SpendingType type);

    @Query("SELECT COUNT(s) FROM Spending s WHERE s.userId IN :userIds AND s.createdAt > :since AND s.type = com.buddi.api.spending.entity.SpendingType.EXPENSE")
    long countByUserIdsAndCreatedAtAfter(@Param("userIds") List<Long> userIds, @Param("since") LocalDateTime since);

    @Query("SELECT DISTINCT s FROM Spending s LEFT JOIN FETCH s.comments c WHERE s.id = :id")
    Optional<Spending> findByIdWithComments(@Param("id") Long id);

    @Query("SELECT DISTINCT s FROM Spending s LEFT JOIN FETCH s.likes WHERE s.id = :id")
    Optional<Spending> findByIdWithLikes(@Param("id") Long id);

    @Query("SELECT l.spending.id, COUNT(l) FROM SpendingLike l WHERE l.spending.id IN :ids AND l.roomId = :roomId GROUP BY l.spending.id")
    List<Object[]> countLikesBySpendingIdInAndRoomId(@Param("ids") List<Long> ids, @Param("roomId") Long roomId);

    @Query("SELECT l.spending.id FROM SpendingLike l WHERE l.userId = :userId AND l.spending.id IN :ids AND l.roomId = :roomId")
    List<Long> findLikedSpendingIdsByUserIdAndRoomId(@Param("userId") Long userId, @Param("ids") List<Long> ids, @Param("roomId") Long roomId);

    @Query("SELECT c.spending.id, COUNT(c) FROM SpendingComment c WHERE c.spending.id IN :ids AND c.roomId = :roomId GROUP BY c.spending.id")
    List<Object[]> countCommentsBySpendingIdInAndRoomId(@Param("ids") List<Long> ids, @Param("roomId") Long roomId);

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
