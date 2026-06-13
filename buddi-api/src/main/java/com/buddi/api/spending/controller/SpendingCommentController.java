package com.buddi.api.spending.controller;

import com.buddi.api.global.oauth2.UserPrincipal;
import com.buddi.api.spending.dto.SpendingCommentRequest;
import com.buddi.api.spending.dto.SpendingCommentResponse;
import com.buddi.api.spending.service.SpendingCommentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class SpendingCommentController {

    private final SpendingCommentService spendingCommentService;

    @GetMapping("/api/rooms/{roomId}/spendings/{spendingId}/comments")
    public ResponseEntity<List<SpendingCommentResponse>> getComments(
            @PathVariable Long roomId,
            @PathVariable Long spendingId) {
        return ResponseEntity.ok(spendingCommentService.getComments(roomId, spendingId));
    }

    @PostMapping("/api/rooms/{roomId}/spendings/{spendingId}/comments")
    public ResponseEntity<SpendingCommentResponse> addComment(
            @PathVariable Long roomId,
            @PathVariable Long spendingId,
            @Valid @RequestBody SpendingCommentRequest request,
            Authentication authentication) {
        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        return ResponseEntity.ok(spendingCommentService.addComment(roomId, spendingId, principal.getUserId(), request));
    }

    @DeleteMapping("/api/rooms/{roomId}/spendings/{spendingId}/comments/{commentId}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable Long roomId,
            @PathVariable Long spendingId,
            @PathVariable Long commentId,
            Authentication authentication) {
        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        spendingCommentService.deleteComment(roomId, spendingId, commentId, principal.getUserId());
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/api/spendings/{spendingId}/comments/{commentId}")
    public ResponseEntity<Void> deleteCommentLegacy(
            @PathVariable Long spendingId,
            @PathVariable Long commentId,
            Authentication authentication) {
        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        spendingCommentService.deleteCommentLegacy(spendingId, commentId, principal.getUserId());
        return ResponseEntity.noContent().build();
    }

}
