package com.itda.dto.request;

import jakarta.validation.constraints.NotBlank;

/**
 * 사업장 등록 요청 DTO
 * - 회사 로고 이미지는 multipart로 별도 전달 (companyLogoImage)
 */
public record WorkplaceCreateRequest(
        String name,
        String companyName,
        String businessNumber,
        String address,

        /** 시/구 단위 행정구역 (예: "서울 강남구"). 자동 매칭 필터에 사용된다. */
        @NotBlank(message = "사업장 행정구역(district)은 필수입니다. 예: 서울 강남구")
        String district
) {}