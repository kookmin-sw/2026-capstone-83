package com.itda.dto.request;

/**
 * 사업장 등록 요청 DTO
 * - 회사 로고 이미지는 multipart로 별도 전달 (companyLogoImage)
 */
public record WorkplaceCreateRequest(
        String name,
        String companyName,
        String businessNumber,
        String address
) {}