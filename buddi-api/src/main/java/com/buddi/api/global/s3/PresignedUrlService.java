package com.buddi.api.global.s3;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.PutObjectPresignRequest;

import java.time.Duration;
import java.util.UUID;

@Slf4j
@Service
public class PresignedUrlService {

    private final S3Presigner presigner;
    private final S3Client s3Client;
    private final String bucket;
    private final String region;

    public PresignedUrlService(
            S3Presigner presigner,
            S3Client s3Client,
            @Value("${aws.s3.image-bucket}") String bucket,
            @Value("${aws.region:ap-northeast-2}") String region) {
        this.presigner = presigner;
        this.s3Client = s3Client;
        this.bucket = bucket;
        this.region = region;
    }

    public record PresignedUploadResponse(String uploadUrl, String fileUrl) {}

    public PresignedUploadResponse generate(String filename, String contentType) {
        String key = "images/" + UUID.randomUUID() + getExtension(filename);

        var presignRequest = PutObjectPresignRequest.builder()
                .signatureDuration(Duration.ofMinutes(5))
                .putObjectRequest(r -> r
                        .bucket(bucket)
                        .key(key)
                        .contentType(contentType))
                .build();

        String uploadUrl = presigner.presignPutObject(presignRequest).url().toString();
        String fileUrl = "https://" + bucket + ".s3." + region + ".amazonaws.com/" + key;

        return new PresignedUploadResponse(uploadUrl, fileUrl);
    }

    public void deleteByUrl(String fileUrl) {
        if (fileUrl == null) return;
        String prefix = "https://" + bucket + ".s3." + region + ".amazonaws.com/";
        if (!fileUrl.startsWith(prefix)) return;
        String key = fileUrl.substring(prefix.length());
        try {
            s3Client.deleteObject(r -> r.bucket(bucket).key(key));
        } catch (Exception e) {
            log.warn("S3 object delete failed: {}", key, e);
        }
    }

    private String getExtension(String filename) {
        if (filename == null || !filename.contains(".")) return ".jpg";
        return filename.substring(filename.lastIndexOf("."));
    }
}
