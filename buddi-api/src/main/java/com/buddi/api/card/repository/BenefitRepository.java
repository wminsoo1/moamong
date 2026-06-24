package com.buddi.api.card.repository;

import com.buddi.api.card.entity.Benefit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface BenefitRepository extends JpaRepository<Benefit, Long> {

    @Query("SELECT b FROM Benefit b " +
            "JOIN FETCH b.group g " +
            "JOIN FETCH g.card c " +
            "WHERE b.merchants LIKE %:merchant% " +
            "OR b.category LIKE %:category%")
    List<Benefit> findByMerchantOrCategory(@Param("merchant") String merchant,
                                           @Param("category") String category);

    @Query("SELECT b FROM Benefit b " +
            "JOIN FETCH b.group g " +
            "JOIN FETCH g.card c " +
            "WHERE b.category LIKE %:category%")
    List<Benefit> findByCategory(@Param("category") String category);

    @Query("SELECT b FROM Benefit b " +
            "JOIN FETCH b.group g " +
            "JOIN FETCH g.card c " +
            "WHERE b.category = '전 가맹점' " +
            "ORDER BY b.discountValue DESC")
    List<Benefit> findFallbackBenefits();
}
