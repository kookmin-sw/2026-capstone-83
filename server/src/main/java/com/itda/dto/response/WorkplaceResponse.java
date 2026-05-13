package com.itda.dto.response;

import com.itda.entity.Workplace;

/**
 * 사업장 응답 DTO
 * Workplace 엔티티를 직접 노출하지 않고 클라이언트가 필요한 필드만 내려준다.
 */
public record WorkplaceResponse(
        Long id,
        String name,
        String companyName,
        String businessNumber,
        String address,
        String companyLogoUrl
) {
    public static WorkplaceResponse from(Workplace w) {
        return new WorkplaceResponse(
                w.getId(),
                w.getName(),
                w.getCompanyName(),
                w.getBusinessNumber(),
                w.getAddress(),
                w.getCompanyLogoUrl()
        );
    }
}
