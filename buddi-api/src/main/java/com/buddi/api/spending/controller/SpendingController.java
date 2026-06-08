package com.buddi.api.spending.controller;

import com.buddi.api.global.oauth2.UserPrincipal;
import com.buddi.api.shareditem.dto.ManualSharedItemRequest;
import com.buddi.api.shareditem.dto.SharedItemResponse;
import com.buddi.api.spending.dto.SpendingListResponse;
import com.buddi.api.spending.dto.SpendingRequest;
import com.buddi.api.spending.dto.SpendingResponse;
import com.buddi.api.spending.service.SpendingCommandService;
import com.buddi.api.spending.service.SpendingQueryService;
import lombok.RequiredArgsConstructor;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/spendings")
@RequiredArgsConstructor
public class SpendingController {

    private final SpendingCommandService spendingCommandService;
    private final SpendingQueryService spendingQueryService;

    @PostMapping
    public ResponseEntity<SpendingResponse> create(@Valid @RequestBody SpendingRequest request,
                                                    Authentication authentication) {
        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        return ResponseEntity.ok(spendingCommandService.create(principal.getUserId(), request));
    }

    @GetMapping
    public ResponseEntity<List<SpendingListResponse>> getMonthly(@RequestParam int year,
                                                                  @RequestParam int month,
                                                                  Authentication authentication) {
        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        return ResponseEntity.ok(spendingQueryService.getMonthly(principal.getUserId(), year, month));
    }

    @GetMapping("/members/{targetUserId}")
    public ResponseEntity<List<SpendingListResponse>> getMemberMonthly(@PathVariable Long targetUserId,
                                                                        @RequestParam int year,
                                                                        @RequestParam int month,
                                                                        Authentication authentication) {
        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        return ResponseEntity.ok(spendingQueryService.getMemberMonthly(principal.getUserId(), targetUserId, year, month));
    }

    @PostMapping("/{id}")
    public ResponseEntity<SpendingResponse> update(@PathVariable Long id,
                                                    @Valid @RequestBody SpendingRequest request,
                                                    Authentication authentication) {
        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        return ResponseEntity.ok(spendingCommandService.update(principal.getUserId(), id, request));
    }

    @PostMapping("/{id}/shared-item/manual")
    public ResponseEntity<List<SharedItemResponse>> markAsSharedItemManual(@PathVariable Long id,
                                                                            @Valid @RequestBody ManualSharedItemRequest request,
                                                                            Authentication authentication) {
        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        String imageUrl = request.imageUrl();
        if (imageUrl == null || imageUrl.isBlank()) {
            try {
                String host = new java.net.URL(request.url()).getHost();
                imageUrl = "https://www.google.com/s2/favicons?domain=" + host + "&sz=128";
            } catch (Exception ignored) {}
        }
        return ResponseEntity.ok(spendingCommandService.markAsSharedItem(
                principal.getUserId(), id, request.roomIds(),
                request.url(), request.title(), imageUrl, request.review(), request.category(), request.isPublic()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id, Authentication authentication) {
        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        spendingCommandService.delete(principal.getUserId(), id);
        return ResponseEntity.noContent().build();
    }

}
