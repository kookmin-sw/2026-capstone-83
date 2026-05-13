package com.itda.dto.request;

/**
 * 사업장 수정 요청 DTO
 * - 부분 수정을 위해 null이 들어온 필드는 변경하지 않는다.
 */
public record WorkplaceUpdateRequest(
        String name,
        String companyName,
        String businessNumber,
        String address,
        String companyLogoUrl
) {}
