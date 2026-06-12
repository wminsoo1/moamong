package com.buddi.api.spending.controller;

import com.buddi.api.global.oauth2.UserPrincipal;
import com.buddi.api.spending.service.SpendingLikeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class SpendingLikeController {

    private final SpendingLikeService spendingLikeService;

    @PostMapping("/api/rooms/{roomId}/spendings/{spendingId}/likes")
    public ResponseEntity<Void> toggleLike(
            @PathVariable Long roomId,
            @PathVariable Long spendingId,
            Authentication authentication) {
        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        spendingLikeService.toggleLike(roomId, spendingId, principal.getUserId());
        return ResponseEntity.ok().build();
    }
}
