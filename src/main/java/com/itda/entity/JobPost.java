package com.itda.entity;

import com.itda.converter.StringListConverter;
import com.itda.enums.JobPostStatus;
import com.itda.enums.WageType;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

/**
 * 구인 공고 Entity
 * 고용주가 사업장(Workplace) 기준으로 공고를 등록
 * 이미지(회사 로고, 상세 이미지)는 S3에 저장하고 URL만 DB에 보관
 */
@Entity
@Table(name = "job_posts")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobPost {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 공고가 속한 사업장 (workplaces 테이블 참조)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "workplace_id", nullable = false)
    private Workplace workplace;

    // 공고 제목
    @Column(nullable = false, length = 150)
    private String title;

    // 업종 대분류 (건설·건축 / 물류·운송 / 식당·서빙 등) - 공고 목록 필터에 사용
    @Column(name = "job_category", nullable = false, length = 50)
    private String jobCategory;

    // 업종 소분류 (지게차 / 배달·운전 등) - 공고 목록 필터에 사용
    @Column(name = "job_subcategory", length = 50)
    private String jobSubcategory;

    // 공고 상세 이미지 S3 URL
    @Column(name = "s3_content_url", length = 500)
    private String s3ContentUrl;

    // 급여 금액
    @Column(nullable = false)
    private Integer wage;

    // 급여 유형 (HOURLY: 시급 / DAILY: 일급 / MONTHLY: 월급)
    @Enumerated(EnumType.STRING)
    @Column(name = "wage_type", nullable = false, length = 10)
    private WageType wageType;

    // 근무 날짜
    @Column(name = "work_date", nullable = false)
    private LocalDate workDate;

    // 근무 시작 시간
    @Column(name = "work_start", nullable = false)
    private LocalTime workStart;

    // 근무 종료 시간
    @Column(name = "work_end", nullable = false)
    private LocalTime workEnd;

    // 총 모집 인원
    @Column(name = "total_slots", nullable = false)
    private Integer totalSlots;

    // 현재 모집된 인원 (지원 승인 시 증가)
    @Column(name = "filled_slots", nullable = false)
    @Builder.Default
    private Integer filledSlots = 0;

    // 공고 상태 (OPEN: 모집중 / CLOSED: 마감 / CANCELLED: 취소)
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private JobPostStatus status;

    // 공고 마감일
    @Column(nullable = false)
    private LocalDate deadline;

    // 공고 상세 텍스트 설명
    @Column(columnDefinition = "TEXT")
    private String description;

    // 지원 자격 목록 - JSON 배열로 저장 (예: ["운전면허 1종", "지게차 자격증"])
    @Convert(converter = StringListConverter.class)
    @Column(columnDefinition = "TEXT")
    private List<String> requirements;

    // 우대사항 목록 - JSON 배열로 저장
    @Convert(converter = StringListConverter.class)
    @Column(columnDefinition = "TEXT")
    private List<String> benefits;

    // 업무 내용 목록 - JSON 배열로 저장 (필수)
    @Convert(converter = StringListConverter.class)
    @Column(columnDefinition = "TEXT")
    private List<String> tasks;

    // 준비물 목록 - JSON 배열로 저장
    @Convert(converter = StringListConverter.class)
    @Column(columnDefinition = "TEXT")
    private List<String> items;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}