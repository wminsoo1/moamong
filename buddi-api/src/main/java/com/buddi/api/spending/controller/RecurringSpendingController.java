package com.buddi.api.spending.controller;

import com.buddi.api.global.oauth2.UserPrincipal;
import com.buddi.api.spending.dto.RecurringSpendingRequest;
import com.buddi.api.spending.dto.RecurringSpendingResponse;
import com.buddi.api.spending.service.RecurringSpendingCommandService;
import com.buddi.api.spending.service.RecurringSpendingQueryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/recurring-spendings")
@RequiredArgsConstructor
public class RecurringSpendingController {

    private final RecurringSpendingCommandService commandService;
    private final RecurringSpendingQueryService queryService;

    @PostMapping
    public ResponseEntity<RecurringSpendingResponse> create(@RequestBody RecurringSpendingRequest request,
                                                             Authentication authentication) {
        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        return ResponseEntity.ok(commandService.create(principal.getUserId(), request));
    }

    @GetMapping
    public ResponseEntity<List<RecurringSpendingResponse>> list(Authentication authentication) {
        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        return ResponseEntity.ok(queryService.list(principal.getUserId()));
    }

    @GetMapping("/active")
    public ResponseEntity<List<RecurringSpendingResponse>> listActive(@RequestParam int year,
                                                                       @RequestParam int month,
                                                                       Authentication authentication) {
        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        return ResponseEntity.ok(queryService.listActiveInMonth(principal.getUserId(), year, month));
    }

    @PostMapping("/{id}")
    public ResponseEntity<RecurringSpendingResponse> update(@PathVariable Long id,
                                                             @RequestBody RecurringSpendingRequest request,
                                                             Authentication authentication) {
        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        return ResponseEntity.ok(commandService.update(principal.getUserId(), id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id, Authentication authentication) {
        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        commandService.delete(principal.getUserId(), id);
        return ResponseEntity.noContent().build();
    }
}
