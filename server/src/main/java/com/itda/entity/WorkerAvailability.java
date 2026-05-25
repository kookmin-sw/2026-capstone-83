package com.itda.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

/**
 * 구직자 가용시간(WorkerAvailability) Entity
 *
 * <h3>설계 원칙</h3>
 * <ol>
 *   <li><b>1 레코드 = 1일치</b>: 한 레코드는 단일 {@code date}(LocalDate) 안에서만
 *       {@code startTime}~{@code endTime}(LocalTime)을 보관한다.</li>
 *   <li><b>자정 넘김 분할</b>: 22:00–익일 06:00 같은 의향은 두 레코드로 쪼개 저장하며,
 *       분할된 두 레코드는 동일한 {@code linkedGroupId}(UUID)를 공유한다.
 *       분할 전 단일 레코드도 자기 UUID를 {@code linkedGroupId}로 갖는다(응답 조립 로직 단일화).</li>
 *   <li><b>비정규화 컬럼 {@code groupStartAt}/{@code groupEndAt}</b>: 분할된 두 레코드 모두
 *       그룹 전체 datetime을 복사 보관한다. 매칭 쿼리에서
 *       {@code groupStartAt ≤ post.start AND groupEndAt ≥ post.end} 단일 비교로 끝낼 수 있다.</li>
 *   <li><b>그룹 단위 취급 주의</b>: 조회/수정/삭제는 항상 {@code linkedGroupId} 기준으로
 *       그룹 전체를 함께 처리해야 한다. 레코드 단건 조작은 데이터 정합성을 깨뜨린다.</li>
 * </ol>
 */
@Entity
@Table(name = "worker_availability",
        indexes = {
                // 주간/월간 캘린더 조회 — 유저 + 날짜 범위 필터
                @Index(name = "idx_avail_user_date",
                        columnList = "user_id, date"),
                // 매칭 쿼리 — 유저 + 그룹 시간 범위 포함 여부
                @Index(name = "idx_avail_user_group_range",
                        columnList = "user_id, group_start_at, group_end_at"),
                // 그룹 단위 조회/삭제 — linkedGroupId 직접 접근
                @Index(name = "idx_avail_group",
                        columnList = "linked_group_id")
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

    /** 이 레코드가 해당하는 날짜 (1 레코드 = 1일치) */
    @Column(nullable = false)
    private LocalDate date;

    /** 해당 날짜의 시작 시각 */
    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;

    /**
     * 해당 날짜의 종료 시각.
     * 자정에 걸쳐 종료되는 첫째 날 레코드는 {@link LocalTime#MAX}(23:59:59.999…)로 저장된다.
     */
    @Column(name = "end_time", nullable = false)
    private LocalTime endTime;

    /**
     * 그룹 식별자 (UUID, 36자).
     * 자정 분할로 생성된 두 레코드가 같은 값을 가지며, 분할되지 않은 단일 레코드도 자기 UUID를 보유한다.
     */
    @Column(name = "linked_group_id", nullable = false, length = 36)
    private String linkedGroupId;

    /**
     * 그룹 전체 시작 일시 (비정규화).
     * 자정 분할된 두 레코드 모두 동일한 값을 보관한다.
     * 매칭 쿼리의 포함 범위 비교({@code groupStartAt ≤ post.start})에 사용된다.
     */
    @Column(name = "group_start_at", nullable = false)
    private LocalDateTime groupStartAt;

    /**
     * 그룹 전체 종료 일시 (비정규화).
     * 자정 분할된 두 레코드 모두 동일한 값을 보관한다.
     * 매칭 쿼리의 포함 범위 비교({@code groupEndAt ≥ post.end})에 사용된다.
     */
    @Column(name = "group_end_at", nullable = false)
    private LocalDateTime groupEndAt;

    /**
     * 최소 수용 근무 길이(분).
     * 0이면 제한 없음(기본값). JobPost 길이(분) < minDurationMinutes 이면 매칭 제외(V1 노이즈 컷).
     */
    @Builder.Default
    @Column(name = "min_duration_minutes", nullable = false)
    private Integer minDurationMinutes = 0;

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
