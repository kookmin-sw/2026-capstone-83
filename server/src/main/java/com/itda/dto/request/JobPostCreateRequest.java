package com.itda.dto.request;

import com.itda.entity.JobPost;
import com.itda.entity.Workplace;
import com.itda.enums.JobPostStatus;
import com.itda.enums.WageType;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

/**
 * 공고 등록 요청 DTO
 * 고용주가 공고 등록 시 프론트에서 전달하는 데이터
 * 이미지 URL은 S3 업로드 후 받은 URL을 문자열로 전달
 */
public record JobPostCreateRequest(

        // 공고 제목
        String title,

        // 업종 대분류 - 옵셔널 (프론트 작업 전까지)
        String jobCategory,

        // 업종 소분류 - 옵셔널
        String jobSubcategory,

        // 급여 금액
        Integer wage,

        // 급여 유형 (HOURLY / DAILY / MONTHLY)
        String wageType,

        // 근무 날짜 (yyyy-MM-dd)
        String workDate,

        // 근무 시작 시간 (HH:mm)
        String workStart,

        // 근무 종료 시간 (HH:mm)
        String workEnd,

        // 총 모집 인원
        Integer totalSlots,

        // 공고 마감일 (yyyy-MM-dd)
        String deadline,

        // 공고 상세 텍스트
        String description,

        // 회사 로고 S3 URL (S3 업로드 후 URL 전달)
        String companyLogoUrl,

        // 상세 이미지 S3 URL (S3 업로드 후 URL 전달)
        String s3ContentUrl,

        // 지원 자격 목록
        List<String> requirements,

        // 우대사항 목록
        List<String> benefits,

        // 업무 내용 목록
        List<String> tasks,

        // 준비물 목록
        List<String> items
) {
    // JobPostCreateRequest -> JobPost Entity 변환
    public JobPost toEntity(Workplace workplace) {
        return JobPost.builder()
                .workplace(workplace)
                .title(title)
                // jobCategory null이면 "미분류"로 기본값 처리
                .jobCategory(jobCategory != null ? jobCategory : "미분류")
                .jobSubcategory(jobSubcategory)
                .wage(wage)
                .wageType(WageType.valueOf(wageType))
                .workDate(LocalDate.parse(workDate))
                .workStart(LocalTime.parse(workStart))
                .workEnd(LocalTime.parse(workEnd))
                .totalSlots(totalSlots)
                .status(JobPostStatus.OPEN)
                .deadline(LocalDate.parse(deadline))
                .description(description)
                .s3ContentUrl(s3ContentUrl)
                .requirements(requirements)
                .benefits(benefits)
                .tasks(tasks)
                .items(items)
                .build();
    }
}