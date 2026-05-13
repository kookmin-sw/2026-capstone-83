package com.itda.dto.request;

/**
 * 사업장 등록 요청 DTO
 * - 회사 로고 이미지는 S3 업로드 연동 전까지 companyLogoUrl(이미 업로드된 URL)로만 받는다.
 */
public record WorkplaceCreateRequest(
        String name,
        String companyName,
        String businessNumber,
        String address,
        String companyLogoUrl
) {}
