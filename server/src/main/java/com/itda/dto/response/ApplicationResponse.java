package com.itda.dto.response;

import com.itda.entity.Application;

/**
 * 지원 내역 응답 DTO (구직자용)
 * - 프론트에서 추가 조회 없이 공고 카드 렌더링 가능하도록 JobPostCardResponse 포함
 * - liked: 로그인 유저의 해당 공고 좋아요 여부
 */
public record ApplicationResponse(
        Long applicationId,
        String status,      // ApplicationStatus (APPLIED / OFFERED / PENDING / HIRED / REJECTED / COMPLETED)
        String appliedAt,
        JobPostCardResponse jobPost,  // 공고 카드 DTO 재활용 (liked 포함)
        Long employerUserId,
        boolean instantHire, // 즉시 채용 오퍼 여부 — 구직자 화면에서 수락 버튼 동작 결정에 사용
        String initiatedBy
) {
    public static ApplicationResponse from(Application application, boolean liked) {
        return new ApplicationResponse(
                application.getId(),
                application.getStatus().name(),
                application.getAppliedAt() != null ? application.getAppliedAt().toString() : null,
                JobPostCardResponse.from(application.getJobPost(), liked),
                application.getJobPost().getWorkplace().getEmployer().getUser().getId(),
                application.isInstantHire(),
                application.getInitiatedBy().name()

        );
    }
}