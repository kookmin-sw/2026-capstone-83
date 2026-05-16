package com.itda.entity;

import com.itda.converter.StringListConverter;
import com.itda.enums.WageType;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

/**
 * 공고 등록 템플릿.
 * 고용주가 반복되는 공고 정보를 미리 저장해두고, 등록 시 불러와 자동 채움.
 * workDate, deadline 등 매번 달라지는 필드는 포함하지 않는다.
 */
@Entity
@Table(name = "job_post_templates")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobPostTemplate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employer_id", nullable = false)
    private Employer employer;

    // 템플릿 이름 (고용주가 구분용으로 지정)
    @Column(name = "template_name", nullable = false, length = 100)
    private String templateName;

    // 공고 제목
    @Column(length = 150)
    private String title;

    // 업종 대분류
    @Column(name = "job_category", length = 50)
    private String jobCategory;

    // 업종 소분류
    @Column(name = "job_subcategory", length = 50)
    private String jobSubcategory;

    // 급여
    @Column
    private Integer wage;

    // 급여 유형
    @Enumerated(EnumType.STRING)
    @Column(name = "wage_type", length = 10)
    private WageType wageType;

    // 근무 시작 시간
    @Column(name = "work_start")
    private LocalTime workStart;

    // 근무 종료 시간
    @Column(name = "work_end")
    private LocalTime workEnd;

    // 총 모집 인원
    @Column(name = "total_slots")
    private Integer totalSlots;

    // 공고 상세 텍스트
    @Column(columnDefinition = "TEXT")
    private String description;

    // 지원 자격 목록
    @Convert(converter = StringListConverter.class)
    @Column(columnDefinition = "TEXT")
    private List<String> requirements;

    // 우대사항 목록
    @Convert(converter = StringListConverter.class)
    @Column(columnDefinition = "TEXT")
    private List<String> benefits;

    // 업무 내용 목록
    @Convert(converter = StringListConverter.class)
    @Column(columnDefinition = "TEXT")
    private List<String> tasks;

    // 준비물 목록
    @Convert(converter = StringListConverter.class)
    @Column(columnDefinition = "TEXT")
    private List<String> items;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
