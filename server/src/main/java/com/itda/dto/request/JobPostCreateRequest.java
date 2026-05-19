package com.itda.dto.request;

import com.itda.entity.JobPost;
import com.itda.entity.Workplace;
import com.itda.enums.JobPostStatus;
import com.itda.enums.WageType;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

/**
 * 공고 등록 요청 DTO
 * @ModelAttribute 바인딩을 위해 record 대신 일반 클래스 사용
 */
@Getter
@Setter
public class JobPostCreateRequest {

    // 공고 제목
    private String title;

    // 업종 대분류 - 옵셔널
    private String jobCategory;

    // 업종 소분류 - 옵셔널
    private String jobSubcategory;

    // 급여 금액
    private Integer wage;

    // 급여 유형 (HOURLY / DAILY / MONTHLY)
    private String wageType;

    // 근무 날짜 (yyyy-MM-dd)
    private String workDate;

    // 근무 시작 시간 (HH:mm)
    private String workStart;

    // 근무 종료 시간 (HH:mm)
    private String workEnd;

    // 총 모집 인원
    private Integer totalSlots;

    // 공고 마감일 (yyyy-MM-dd)
    private String deadline;

    // 공고 상세 텍스트
    private String description;

    // 회사 로고 S3 URL
    private String companyLogoUrl;

    // 상세 이미지 S3 URL
    private String s3ContentUrl;

    // 지원 자격 목록 (JSON 배열)
    private List<String> requirements;

    // 우대사항 목록
    private List<String> benefits;

    // 업무 내용 목록
    private List<String> tasks;

    // 준비물 목록
    private List<String> items;

    // 새 파일 업로드 없이 기존 S3 URL을 그대로 재사용할 때 (사업장 로고 재사용 등)
    private String existingImageUrl;

    // S3 업로드 완료 후 contentUrl을 받아서 엔티티 생성하는 버전
    // 기존 toEntity(workplace)는 그대로 유지
    public JobPost toEntity(Workplace workplace, String contentUrl) {
        return JobPost.builder()
                .workplace(workplace)
                .title(title)
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
                .s3ContentUrl(contentUrl) // 기존은 request의 s3ContentUrl 사용, 여기선 업로드 결과 URL 사용
                .requirements(requirements)
                .benefits(benefits)
                .tasks(tasks)
                .items(items)
                .build();
    }
}