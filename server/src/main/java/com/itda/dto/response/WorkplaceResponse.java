package com.itda.dto.response;

import com.itda.entity.Workplace;

/**
 * 사업장 응답 DTO
 * Workplace Entity를 외부에 노출할 때 사용 (employer 객체 그대로 직렬화 방지).
 */
public record WorkplaceResponse(
        Long id,
        String name,
        String companyName,
        String businessNumber,
        String address,
        String companyLogoUrl,
        String createdAt
) {
    public static WorkplaceResponse from(Workplace workplace) {
        return new WorkplaceResponse(
                workplace.getId(),
                workplace.getName(),
                workplace.getCompanyName(),
                workplace.getBusinessNumber(),
                workplace.getAddress(),
                workplace.getCompanyLogoUrl(),
                workplace.getCreatedAt() != null ? workplace.getCreatedAt().toString() : null
        );
    }
}
