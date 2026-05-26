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
 * 고용주가 사업장(Workplace) 기준으로 공고를 등록.
 * 이미지(회사 로고, 상세 이미지)는 S3에 저장하고 URL만 DB에 보관.
 *
 * <h3>자정 넘김 공고와 그룹 컬럼</h3>
 * <p>WorkerAvailability 와 동일한 "1 레코드 = 1일치" 원칙을 따른다.
 * 22:00–익일 06:00 처럼 자정을 넘기는 공고는 두 레코드로 분할 저장되며,
 * 분할된 두 레코드는 같은 {@code linkedGroupId}(UUID) 를 공유한다.
 *
 * <ul>
 *   <li><b>{@code linkedGroupId} / {@code groupStartAt} / {@code groupEndAt}</b> 는
 *       매칭(WorkerAvailability ⊇ JobPost 포함 비교)과 자정 분할 전용 컬럼이다.
 *       목록 표시·필터·캘린더에는 기존 {@code workDate}/{@code workStart}/{@code workEnd} 를 사용한다.</li>
 *   <li>{@code groupStartAt} / {@code groupEndAt} 은 비정규화 컬럼 —
 *       분할된 두 레코드 모두 동일한 값을 보관한다.</li>
 *   <li>삭제·마감 등 운영 작업은 반드시 {@code linkedGroupId} 기준으로 그룹 전체를 대상으로 해야 한다.</li>
 * </ul>
 */
@Entity
@Table(name = "job_posts",
        indexes = {
                @Index(name = "idx_jobpost_group_range",
                        columnList = "group_start_at, group_end_at")
        })
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
    //@Column(name = "job_category", nullable = false, length = 50)
    //private String jobCategory;
    @Column(name = "job_category", length = 50)
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

    // 연령/성별/학력 등 인적 필수 조건 - JSON 배열로 저장 (예: ["ADULT_ONLY", "GENDER_ANY"])
    // 자격/인증 종류의 필수 조건은 requirements 컬럼에 그대로 적재됩니다.
    @Convert(converter = StringListConverter.class)
    @Column(name = "age_requirements", columnDefinition = "TEXT")
    private List<String> ageRequirements;

    // ─── 그룹 컬럼 (매칭·자정 분할 전용) ─────────────────────────

    /**
     * 그룹 식별자 (UUID, 36자).
     * 자정 분할된 두 레코드가 같은 값을 가지며, 분할되지 않은 단일 레코드도 자기 UUID를 보유한다.
     */
    @Column(name = "linked_group_id", nullable = false, length = 36)
    private String linkedGroupId;

    /**
     * 그룹 전체 시작 일시 (비정규화).
     * 매칭 쿼리의 포함 범위 비교({@code groupStartAt ≤ avail.groupStartAt})에 사용된다.
     */
    @Column(name = "group_start_at", nullable = false)
    private LocalDateTime groupStartAt;

    /**
     * 그룹 전체 종료 일시 (비정규화).
     * 매칭 쿼리의 포함 범위 비교({@code groupEndAt ≥ avail.groupEndAt})에 사용된다.
     * 사용자에게 표시할 workEnd 는 이 컬럼의 LocalTime 부분에서 읽는다.
     */
    @Column(name = "group_end_at", nullable = false)
    private LocalDateTime groupEndAt;

    // ─── Audit 컬럼 ──────────────────────────────────────────────

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    // ─── 상태 변경 메서드 ───────────────────────────────────────

    /**
     * 채용 확정 시 filledSlots 증가 + 인원 마감 시 자동 CLOSED
     */
    public void confirmHire() {
        if (this.filledSlots >= this.totalSlots) {
            throw new IllegalStateException("모집 인원이 모두 찼습니다.");
        }
        this.filledSlots += 1;
        if (this.filledSlots >= this.totalSlots) {
            this.status = JobPostStatus.CLOSED;
        }
    }

    /**
     * 기간 만료에 의한 자동 마감 (스케줄러)
     */
    public void closeByExpiry() {
        this.status = JobPostStatus.CLOSED;
    }

    /**
     * 고용주에 의한 수동 마감
     */
    public void closeByEmployer() {
        this.status = JobPostStatus.CLOSED;
    }

    /**
     * 채용 취소 시 filledSlots 감소 + 공고 재오픈
     */
    public void cancelHire() {
        if (this.filledSlots > 0) {
            this.filledSlots -= 1;
        }
        if (this.status == JobPostStatus.CLOSED && this.filledSlots < this.totalSlots) {
            this.status = JobPostStatus.OPEN;
        }
    }
    // ─── 추가 매서드 ───────────────────────────────────────

    // 급구 옵션
    @Column(name = "urgent_enabled")
    @Builder.Default
    private Boolean urgentEnabled = false;

    // 급구 트리거 발동 여부 (중복 인상 방지)
    @Column(name = "urgent_triggered")
    @Builder.Default
    private Boolean urgentTriggered = false;

    @Column(name = "urgent_wage_increase")
    private Integer urgentWageIncrease;

    // 자동 오퍼 옵션
    @Column(name = "auto_offer_enabled")
    @Builder.Default
    private Boolean autoOfferEnabled = false;

    // 급구 트리거 발동 메서드
    public void applyUrgentWage() {
        if (this.urgentEnabled && this.urgentWageIncrease != null
                && !Boolean.TRUE.equals(this.urgentTriggered)) {
            this.wage += this.urgentWageIncrease;
            this.urgentTriggered = true;
        }
    }
}