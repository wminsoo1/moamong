package com.buddi.api.global.s3;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/upload")
@RequiredArgsConstructor
public class UploadController {

    private final PresignedUrlService presignedUrlService;

    @GetMapping("/presigned")
    public ResponseEntity<PresignedUrlService.PresignedUploadResponse> getPresignedUrl(
            @RequestParam String filename,
            @RequestParam String contentType,
            Authentication authentication) {
        return ResponseEntity.ok(presignedUrlService.generate(filename, contentType));
    }
}
