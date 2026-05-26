package com.itda.dto.response;

import com.itda.entity.JobPost;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

// 공고 목록 카드 응답 DTO
// 공고 목록 화면에서 카드 하나에 필요한 필드만 포함
// 지원자/고용주 공통 사용 (버튼은 프론트에서 role 기준으로 처리)
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
        String jobSubcategory,

        // 좋아요 여부
        boolean liked,

        // 급구 여부
        Boolean urgentEnabled,
        Integer urgentWageIncrease,

        // 맞춤 추천(RECOMMENDED) 정렬 시 산출된 랭킹 점수.
        // 다른 정렬 방식(최신순 등)에서는 null.
        Integer score
) {
    // liked·score 없는 기본 변환 (비로그인 or liked/score 불필요한 경우)
    public static JobPostCardResponse from(JobPost post) {
        return from(post, false, null);
    }

    // liked 포함, score 없는 변환
    public static JobPostCardResponse from(JobPost post, boolean liked) {
        return from(post, liked, null);
    }

    // liked·score 모두 포함하는 풀 변환 (RECOMMENDED 정렬에서 사용)
    public static JobPostCardResponse from(JobPost post, boolean liked, Integer score) {
        long leftDays = ChronoUnit.DAYS.between(LocalDate.now(), post.getDeadline());

        // workEnd 는 단일 레코드에 항상 사용자 원래 입력값이 저장되어 있음.
        String workEndDisplay = post.getWorkEnd().toString();

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
                workEndDisplay,
                leftDays,
                post.getStatus().name(),
                post.getDeadline().toString(),
                post.getJobCategory(),
                post.getJobSubcategory(),
                liked,
                post.getUrgentEnabled(),
                post.getUrgentWageIncrease(),
                score
        );
    }
}