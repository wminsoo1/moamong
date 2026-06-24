package com.buddi.api.card.service;

import com.buddi.api.card.dto.BenefitSearchResponse;
import com.buddi.api.card.dto.SearchAliasResponse;
import com.buddi.api.card.entity.Benefit;
import com.buddi.api.card.entity.BenefitGroupType;
import com.buddi.api.card.entity.DiscountType;
import com.buddi.api.card.repository.BenefitRepository;
import com.buddi.api.card.repository.SearchAliasRepository;
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
    private final BenefitRepository benefitRepository;

    private static final Set<DiscountType> CONDITIONAL_TYPES = Set.of(DiscountType.GEO_PRICE);
    private static final Set<BenefitGroupType> CONDITIONAL_GROUP_TYPES = Set.of(BenefitGroupType.DYNAMIC);

    public List<SearchAliasResponse> searchAliases(String keyword) {
        return searchAliasRepository.findByKeywordContaining(keyword).stream()
                .map(SearchAliasResponse::new)
                .toList();
    }

    public record BenefitSearchResult(
            List<BenefitSearchResponse> benefits,
            List<BenefitSearchResponse> conditionalBenefits,
            List<BenefitSearchResponse> fallbackBenefits
    ) {}

    public BenefitSearchResult searchBenefits(String category, String merchant) {
        List<Benefit> results;
        if (merchant != null && !merchant.isBlank()) {
            results = benefitRepository.findByMerchantOrCategory(merchant, category);
        } else {
            results = benefitRepository.findByCategory(category);
        }

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

        List<BenefitSearchResponse> fallback = normal.isEmpty() && conditional.isEmpty()
                ? benefitRepository.findFallbackBenefits().stream()
                    .map(b -> BenefitSearchResponse.of(b, "CATEGORY"))
                    .toList()
                : List.of();

        return new BenefitSearchResult(normal, conditional, fallback);
    }

    private Stream<BenefitSearchResponse> classifyBenefit(Benefit benefit, String merchant) {
        boolean directMatch = merchant != null
                && benefit.getMerchants() != null
                && benefit.getMerchants().contains(merchant);

        boolean categoryMatch = true;

        if (directMatch) {
            return Stream.of(BenefitSearchResponse.of(benefit, "DIRECT"));
        }
        if (categoryMatch) {
            return Stream.of(BenefitSearchResponse.of(benefit, "CATEGORY"));
        }
        return Stream.empty();
    }

    private boolean isConditional(BenefitSearchResponse r) {
        try {
            if (CONDITIONAL_TYPES.contains(DiscountType.valueOf(r.discountType()))) return true;
            if (CONDITIONAL_GROUP_TYPES.contains(BenefitGroupType.valueOf(r.benefitGroupType()))) return true;
        } catch (IllegalArgumentException ignored) {}
        return false;
    }
}
