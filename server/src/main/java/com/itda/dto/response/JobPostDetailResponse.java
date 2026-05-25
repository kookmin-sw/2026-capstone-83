package com.itda.dto.response;

import com.itda.entity.JobPost;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

/**
 * 공고 상세 조회 응답 DTO
 * 공고 카드 클릭 시 상세 페이지에서 사용
 * JobPostCardResponse 필드 + 상세 정보(배열 필드, 이미지 URL 등) 포함
 */
public record JobPostDetailResponse(

        // 기본 카드 필드
        Long id,
        String title,
        String company,
        String companyLogoUrl,
        String location,
        Integer wage,
        String wageType,
        Integer totalSlots,
        Integer filledSlots,
        String workDate,
        String workStart,
        String workEnd,
        long leftDays,
        String status,
        String deadline,
        String jobCategory,
        String jobSubcategory,

        // 상세 전용 필드
        String description,
        String s3ContentUrl,
        List<String> requirements,
        List<String> benefits,
        List<String> tasks,
        List<String> items,
        String createdAt,
        String updatedAt,

        // 좋아요 여부
        boolean liked
) {
    // liked 포함 버전
    public static JobPostDetailResponse from(JobPost post, boolean liked) {
        long leftDays = ChronoUnit.DAYS.between(LocalDate.now(), post.getDeadline());

        // workEnd 표시: 자정 분할된 Day1 레코드는 workEnd=LocalTime.MAX 로 저장되므로
        // groupEndAt.toLocalTime() 을 우선 사용한다 (사용자 원래 입력값이 보존되어 있음).
        // groupEndAt 이 null 인 경우(migration 전 old data)에는 workEnd 를 그대로 사용.
        String workEndDisplay = post.getGroupEndAt() != null
                ? post.getGroupEndAt().toLocalTime().toString()
                : post.getWorkEnd().toString();

        return new JobPostDetailResponse(
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
                post.getDescription(),
                post.getS3ContentUrl(),
                post.getRequirements(),
                post.getBenefits(),
                post.getTasks(),
                post.getItems(),
                post.getCreatedAt() != null ? post.getCreatedAt().toString() : null,
                null,
                liked
        );
    }
}