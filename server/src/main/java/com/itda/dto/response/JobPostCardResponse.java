package com.itda.dto.response;

import com.itda.entity.JobPost;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

/**
 * 공고 목록 카드 응답 DTO
 * 공고 목록 화면에서 카드 하나에 필요한 필드만 포함
 * 지원자/고용주 공통 사용 (버튼은 프론트에서 role 기준으로 처리)
 */
public record JobPostCardResponse(

        Long id,
        String title,

        // 회사명 (workplace.companyName)
        String company,

        // 회사 로고 URL (workplace.companyLogoUrl)
        String companyLogoUrl,

        // 근무지 주소 (workplace.address)
        String location,

        Integer wage,
        String wageType,
        Integer totalSlots,
        Integer filledSlots,
        String workDate,
        String workStart,
        String workEnd,

        // 마감까지 남은 일수 (D-7 표시용)
        long leftDays,

        // 공고 상태 (OPEN / CLOSED / CANCELLED)
        String status,
        String deadline,
        String jobCategory,
        String jobSubcategory
) {
    // JobPost Entity -> JobPostCardResponse 변환
    public static JobPostCardResponse from(JobPost post) {
        long leftDays = ChronoUnit.DAYS.between(LocalDate.now(), post.getDeadline());
        return new JobPostCardResponse(
                post.getId(),
                post.getTitle(),
                post.getWorkplace().getCompanyName(),
                post.getWorkplace().getCompanyLogoUrl(),
                post.getWorkplace().getAddress(),
                post.getWage(),
                post.getWageType().name(),
                post.getTotalSlots(),
                post.getFilledSlots(),
                post.getWorkDate().toString(),
                post.getWorkStart().toString(),
                post.getWorkEnd().toString(),
                leftDays,
                post.getStatus().name(),
                post.getDeadline().toString(),
                post.getJobCategory(),
                post.getJobSubcategory()
        );
    }
}
