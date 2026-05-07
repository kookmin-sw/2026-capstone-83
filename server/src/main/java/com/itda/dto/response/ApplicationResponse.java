package com.itda.dto.response;

import com.itda.entity.Application;

/**
 * 지원 내역 응답 DTO (구직자용)
 * 내 지원 목록 조회에서 사용
 */
public record ApplicationResponse(
        Long applicationId,
        Long jobPostId,
        String title,
        String company,
        String status,
        String appliedAt
) {
    public static ApplicationResponse from(Application application) {
        return new ApplicationResponse(
                application.getId(),
                application.getJobPost().getId(),
                application.getJobPost().getTitle(),
                application.getJobPost().getWorkplace().getCompanyName(),
                application.getStatus().name(),
                application.getAppliedAt() != null ? application.getAppliedAt().toString() : null
        );
    }
}
