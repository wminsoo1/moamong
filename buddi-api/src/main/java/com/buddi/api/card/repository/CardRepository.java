package com.buddi.api.card.repository;

import com.buddi.api.card.entity.Card;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface CardRepository extends JpaRepository<Card, Long> {

    @Query("SELECT DISTINCT c FROM Card c " +
           "JOIN FETCH c.benefitGroups bg " +
           "JOIN FETCH bg.benefits b " +
           "WHERE c.id IN :cardIds " +
           "AND (b.merchants LIKE %:merchant% OR b.category LIKE %:category%)")
    List<Card> findByIdsWithMatchingBenefitsByMerchantOrCategory(
            @Param("cardIds") List<Long> cardIds,
            @Param("merchant") String merchant,
            @Param("category") String category);

    @Query("SELECT DISTINCT c FROM Card c " +
           "JOIN FETCH c.benefitGroups bg " +
           "JOIN FETCH bg.benefits b " +
           "WHERE c.id IN :cardIds " +
           "AND b.category LIKE %:category%")
    List<Card> findByIdsWithMatchingBenefitsByCategory(
            @Param("cardIds") List<Long> cardIds,
            @Param("category") String category);
}
