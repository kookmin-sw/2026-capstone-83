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

        // 상세 이미지 S3 URL
        String s3ContentUrl,

        // 지원 자격 목록 (JSON 배열 -> List<String>)
        List<String> requirements,

        // 우대사항 목록
        List<String> benefits,

        // 업무 내용 목록 (필수)
        List<String> tasks,

        // 준비물 목록
        List<String> items,

        String createdAt,
        String updatedAt
) {
    // JobPost Entity -> JobPostDetailResponse 변환
    public static JobPostDetailResponse from(JobPost post) {
        long leftDays = ChronoUnit.DAYS.between(LocalDate.now(), post.getDeadline());
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
                post.getWorkEnd().toString(),
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
                null // updatedAt은 Entity에 없어서 null 처리
        );
    }
}