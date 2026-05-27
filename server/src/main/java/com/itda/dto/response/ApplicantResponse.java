package com.itda.dto.response;

import com.itda.entity.Application;
import com.itda.entity.User;
import java.time.LocalDate;
import java.time.Period;

/**
 * 지원자/근무자 정보 응답 DTO (고용주용)
 * 지원자 목록 조회, 근무자 목록 조회에서 공통 사용
 */
public record ApplicantResponse(
        Long applicationId,
        Long userId,
        Long resumeId,
        String name,
        String phone,
        String profileImageUrl,
        String gender,
        int age,
        String location,
        long matchCount,
        String status,
        String appliedAt,
        boolean instantHire, // 즉시 채용 오퍼 여부
        String initiatedBy
) {
    public static ApplicantResponse from(Application application, long matchCount, Long resumeId) {
        User user = application.getApplicantUser();
        int age = 0;
        if (user.getBirth() != null) {
            age = Period.between(user.getBirth(), LocalDate.now()).getYears();
        }

        return new ApplicantResponse(
                application.getId(),
                user.getId(),
                resumeId,
                user.getName(),
                user.getPhone(),
                user.getProfileImageUrl(),
                user.getGender() != null ? user.getGender().name() : null,
                age,
                user.getLocation(),
                matchCount,
                application.getStatus().name(),
                application.getAppliedAt() != null ? application.getAppliedAt().toString() : null,
                application.isInstantHire(),
                application.getInitiatedBy().name()

                
        );
    }
}
