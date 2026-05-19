package com.itda.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.IOException;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class S3Service {

    public static final String PATH_LOGOS     = "uploads/logos";
    public static final String PATH_PROFILES  = "uploads/profiles";
    public static final String PATH_JOB_POSTS = "uploads/job-posts";

    private final S3Client s3Client;

    // application.yml의 cloud.aws.s3.bucket 값 주입
    @Value("${cloud.aws.s3.bucket}")
    private String bucket;

    // 파일 업로드 후 S3 URL 반환
    // folder : 저장할 폴더명 (예: "uploads/logos", "uploads/profiles", "job-posts")
    public String upload(MultipartFile file, String folder) {
        // UUID로 파일명 중복 방지
        String key = folder + "/" + UUID.randomUUID() + "_" + file.getOriginalFilename();

        try {
            PutObjectRequest request = PutObjectRequest.builder()
                    .bucket(bucket)
                    .key(key)
                    .contentType(file.getContentType())
                    .contentLength(file.getSize())
                    .build();

            // 스트림으로 S3에 업로드
            s3Client.putObject(request,
                    RequestBody.fromInputStream(file.getInputStream(), file.getSize()));

        } catch (IOException e) {
            throw new RuntimeException("S3 업로드 실패: " + e.getMessage());
        }

        // 업로드된 파일의 퍼블릭 URL 반환
        return "https://" + bucket + ".s3.us-east-1.amazonaws.com/" + key;
    }

    // S3 파일 삭제
    // fileUrl : 삭제할 파일의 전체 URL
    public void delete(String fileUrl) {
        // URL이 없으면 스킵
        if (fileUrl == null || fileUrl.isBlank()) return;

        // URL에서 버킷 이후 key 부분만 추출
        String key = fileUrl.substring(fileUrl.indexOf(".amazonaws.com/") + 15);

        s3Client.deleteObject(DeleteObjectRequest.builder()
                .bucket(bucket)
                .key(key)
                .build());
    }
}