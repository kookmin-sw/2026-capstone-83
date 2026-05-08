package com.itda.dto.request;

/**
 * 사업장 등록 요청 DTO
 * 로그인한 EMPLOYER가 자기 employer에 소속될 사업장을 새로 만든다.
 */
public record WorkplaceCreateRequest(
        // 사업장 이름 (예: "성수점", "본사 창고")
        String name,

        // 회사명 (사업자등록증 기준)
        String companyName,

        // 사업자등록번호 (선택)
        String businessNumber,

        // 사업장 주소
        String address,

        // 회사 로고 S3 URL (선택)
        String companyLogoUrl
) {}
