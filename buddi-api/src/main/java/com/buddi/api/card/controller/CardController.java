package com.buddi.api.card.controller;

import com.buddi.api.card.dto.SearchAliasResponse;
import com.buddi.api.card.service.CardQueryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/cards")
@RequiredArgsConstructor
public class CardController {

    private final CardQueryService cardQueryService;

    @GetMapping("/search/aliases")
    public ResponseEntity<List<SearchAliasResponse>> searchAliases(
            @RequestParam String keyword) {
        return ResponseEntity.ok(cardQueryService.searchAliases(keyword));
    }

    @GetMapping("/search/benefits")
    public ResponseEntity<CardQueryService.BenefitSearchResult> searchBenefits(
            @RequestParam String category,
            @RequestParam(required = false) String merchant) {
        return ResponseEntity.ok(cardQueryService.searchBenefits(category, merchant));
    }
}
