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
        Long userId,
        String name,
        String phone,             // 전화번호
        String profileImageUrl,   // 프로필 사진 S3 URL
        String gender,            // MALE / FEMALE
        int age,                  // 생년월일 기반 계산
        String address,           // 사는 지역
        long matchCount,          // 앱 매칭 횟수
        String status,            // 지원 상태
        String appliedAt
) {
    public static ApplicantResponse from(Application application, long matchCount) {
        User user = application.getApplicantUser();
        int age = 0;
        if (user.getBirthDate() != null) {
            age = Period.between(user.getBirthDate(), LocalDate.now()).getYears();
        }

        return new ApplicantResponse(
                user.getId(),
                user.getName(),
                user.getPhone(),
                user.getProfileImageUrl(),
                user.getGender() != null ? user.getGender().name() : null,
                age,
                user.getAddress(),
                matchCount,
                application.getStatus().name(),
                application.getAppliedAt() != null ? application.getAppliedAt().toString() : null
        );
    }
}
