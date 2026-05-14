package com.itda.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.InstanceProfileCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;

@Configuration
public class S3Config {

    @Bean
    public S3Client s3Client() {
        // EC2 IAM Role로 자격증명 자동 획득 (Access Key 불필요)
        // Region은 버킷이 위치한 us-east-1 고정
        return S3Client.builder()
                .region(Region.US_EAST_1)
                .credentialsProvider(InstanceProfileCredentialsProvider.create())
                .build();
    }
}