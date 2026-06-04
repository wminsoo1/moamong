package com.buddi.api.spending.controller;

import com.buddi.api.global.oauth2.UserPrincipal;
import com.buddi.api.spending.dto.CategoryStatsResponse;
import com.buddi.api.spending.dto.WeeklyStatsResponse;
import com.buddi.api.spending.service.SpendingQueryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/stats")
@RequiredArgsConstructor
public class StatsController {

    private final SpendingQueryService spendingQueryService;

    @GetMapping("/weekly")
    public ResponseEntity<WeeklyStatsResponse> getWeeklyStats(@RequestParam int year,
                                                               @RequestParam int month,
                                                               Authentication authentication) {
        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        return ResponseEntity.ok(spendingQueryService.getWeeklyStats(principal.getUserId(), year, month));
    }

    @GetMapping("/category")
    public ResponseEntity<CategoryStatsResponse> getCategoryStats(@RequestParam int year,
                                                                   @RequestParam int month,
                                                                   Authentication authentication) {
        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        return ResponseEntity.ok(spendingQueryService.getCategoryStats(principal.getUserId(), year, month));
    }
}
