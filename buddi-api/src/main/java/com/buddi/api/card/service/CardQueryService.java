package com.buddi.api.card.service;

import com.buddi.api.card.dto.BenefitSearchResponse;
import com.buddi.api.card.dto.CardResponse;
import com.buddi.api.card.dto.SearchAliasResponse;
import com.buddi.api.card.entity.Benefit;
import com.buddi.api.card.entity.BenefitGroupType;
import com.buddi.api.card.entity.Card;
import com.buddi.api.card.entity.DiscountType;
import com.buddi.api.card.repository.CardRepository;
import com.buddi.api.card.repository.SearchAliasRepository;
import com.buddi.api.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CardQueryService {

    private final SearchAliasRepository searchAliasRepository;
    private final CardRepository cardRepository;
    private final UserRepository userRepository;

    private static final Set<DiscountType> CONDITIONAL_TYPES = Set.of(DiscountType.GEO_PRICE);
    private static final Set<BenefitGroupType> CONDITIONAL_GROUP_TYPES = Set.of(BenefitGroupType.DYNAMIC);

    public List<SearchAliasResponse> searchAliases(String keyword) {
        return searchAliasRepository.findByKeywordContaining(keyword).stream()
                .map(SearchAliasResponse::new)
                .toList();
    }

    public List<CardResponse> getAllCards() {
        return cardRepository.findAll().stream().map(CardResponse::new).toList();
    }

    public record BenefitSearchResult(
            List<BenefitSearchResponse> benefits,
            List<BenefitSearchResponse> conditionalBenefits,
            List<BenefitSearchResponse> fallbackBenefits
    ) {}

    public BenefitSearchResult searchBenefits(String category, String merchant, Long userId) {
        List<Long> cardIds = userRepository.findCardIdsByUserId(userId);
        if (cardIds.isEmpty()) {
            return new BenefitSearchResult(List.of(), List.of(), List.of());
        }

        List<Card> cards;
        if (merchant != null && !merchant.isBlank()) {
            cards = cardRepository.findByIdsWithMatchingBenefitsByMerchantOrCategory(cardIds, merchant, category);
        } else {
            cards = cardRepository.findByIdsWithMatchingBenefitsByCategory(cardIds, category);
        }

        List<Benefit> results = cards.stream()
                .flatMap(c -> c.getBenefitGroups().stream())
                .flatMap(bg -> bg.getBenefits().stream())
                .filter(b -> matchesCategoryOrMerchant(b, category, merchant))
                .toList();

        List<BenefitSearchResponse> all = results.stream()
                .flatMap(b -> classifyBenefit(b, merchant))
                .toList();

        List<BenefitSearchResponse> normal = new ArrayList<>();
        List<BenefitSearchResponse> conditional = new ArrayList<>();

        for (BenefitSearchResponse r : all) {
            if (isConditional(r)) {
                conditional.add(r);
            } else {
                normal.add(r);
            }
        }

        normal.sort(Comparator
                .comparing((BenefitSearchResponse r) -> "DIRECT".equals(r.matchType()) ? 0 : 1)
                .thenComparing(BenefitSearchResponse::discountValue, Comparator.reverseOrder()));

        return new BenefitSearchResult(normal, conditional, List.of());
    }

    private boolean matchesCategoryOrMerchant(Benefit b, String category, String merchant) {
        if (merchant != null && !merchant.isBlank()) {
            boolean merchantMatch = b.getMerchants() != null && b.getMerchants().contains(merchant);
            boolean categoryMatch = b.getCategory() != null && b.getCategory().contains(category);
            return merchantMatch || categoryMatch;
        }
        return b.getCategory() != null && b.getCategory().contains(category);
    }

    private Stream<BenefitSearchResponse> classifyBenefit(Benefit benefit, String merchant) {
        boolean directMatch = merchant != null
                && benefit.getMerchants() != null
                && benefit.getMerchants().contains(merchant);

        if (directMatch) {
            return Stream.of(BenefitSearchResponse.of(benefit, "DIRECT"));
        }
        return Stream.of(BenefitSearchResponse.of(benefit, "CATEGORY"));
    }

    private boolean isConditional(BenefitSearchResponse r) {
        try {
            if (CONDITIONAL_TYPES.contains(DiscountType.valueOf(r.discountType()))) return true;
            if (CONDITIONAL_GROUP_TYPES.contains(BenefitGroupType.valueOf(r.benefitGroupType()))) return true;
        } catch (IllegalArgumentException ignored) {}
        return false;
    }
}
