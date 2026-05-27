package com.itda.entity;

import com.itda.converter.StringListConverter;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 구직자 가용시간(WorkerAvailability) Entity
 *
 * <h3>설계 원칙</h3>
 * <ol>
 *   <li><b>1 레코드 = 1 슬롯</b>: 한 레코드가 {@code availStartAt}~{@code availEndAt}
 *       전체 datetime 을 직접 보관한다. 자정 넘김(야간 슬롯)도 분할 없이 한 행으로 저장된다.</li>
 *   <li><b>야간 슬롯</b>: {@code availEndAt > availStartAt} 이며 날짜가 다를 수 있다.
 *       예) availStartAt=2030-06-01T22:00, availEndAt=2030-06-02T06:00</li>
 *   <li><b>매칭 쿼리</b>:
 *       {@code avail_start_at <= post.work_start_at AND avail_end_at >= post.work_end_at}</li>
 * </ol>
 */
@Entity
@Table(name = "worker_availability",
        indexes = {
                // 사용자별 범위 조회 (캘린더 뷰)
                @Index(name = "idx_avail_user_range",
                        columnList = "user_id, avail_start_at, avail_end_at"),
        })
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkerAvailability {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** 가용시간을 등록한 구직자 */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    /**
     * 가용시간 슬롯 시작 일시.
     * 야간 슬롯의 경우 당일 저녁 시각 (예: 2030-06-01T22:00).
     */
    @Column(name = "avail_start_at", nullable = false)
    private LocalDateTime availStartAt;

    /**
     * 가용시간 슬롯 종료 일시.
     * 야간 슬롯의 경우 익일 시각 (예: 2030-06-02T06:00).
     * 항상 {@code availStartAt} 보다 크며, 날짜가 다를 수 있다.
     */
    @Column(name = "avail_end_at", nullable = false)
    private LocalDateTime availEndAt;

    /**
     * 최소 수용 근무 길이(분).
     * 0이면 제한 없음(기본값). JobPost 길이(분) &lt; minDurationMinutes 이면 매칭 제외.
     */
    @Builder.Default
    @Column(name = "min_duration_minutes", nullable = false)
    private Integer minDurationMinutes = 0;

    /**
     * 희망 근무 지역 목록 — 시/구 단위 행정구역 (예: ["서울 강남구", "서울 마포구"]).
     * 자동 매칭 시 공고 사업장의 district 가 이 목록에 포함되어야 매칭된다.
     * 빈 목록은 허용되지 않으며, 최소 1개 이상의 지역을 입력해야 한다.
     */
    @Convert(converter = StringListConverter.class)
    @Column(name = "preferred_districts", nullable = false, columnDefinition = "TEXT")
    private List<String> preferredDistricts;

    /** 레코드 최초 생성 일시 */
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    /** 레코드 최종 수정 일시 */
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
