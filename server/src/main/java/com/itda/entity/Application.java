package com.itda.entity;

import com.itda.enums.ApplicationStatus;
import com.itda.enums.InitiatedBy;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "applications",
        uniqueConstraints = @UniqueConstraint(columnNames = {"job_post_id", "applicant_user_id"}))
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Application {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_post_id", nullable = false)
    private JobPost jobPost;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "applicant_user_id", nullable = false)
    private User applicantUser;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private ApplicationStatus status;

    @Enumerated(EnumType.STRING)
    @Column(name = "initiated_by", nullable = false, length = 10)
    private InitiatedBy initiatedBy;

    /**
     * 즉시 채용 오퍼 플래그 (오퍼 발송 시점 정책 스냅샷).
     * true  → 구직자 수락 시 OFFERED → HIRED 즉시 전환 (장기근무자·이력서 좋아요 대상)
     * false → 구직자 수락 시 OFFERED → PENDING (고용주 최종 확정 대기)
     * 오퍼 발송 후 변경되지 않는다.
     */
    @Builder.Default
    @Column(name = "instant_hire", nullable = false)
    private boolean instantHire = false;

    @Column(name = "applied_at", updatable = false)
    private LocalDateTime appliedAt;

    // 자동 매칭으로 생성된 경우, 원인이 된 가용시간 슬롯 ID
    @Column(name = "source_availability_id")
    private Long sourceAvailabilityId;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.appliedAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    /**
     * 근무 완료 자동 처리 시 호출 (스케줄러 전용)
     */
    public void completeWork() {
        this.status = ApplicationStatus.COMPLETED;
    }

    /**
     * 지원 취소 시 호출
     */
    public void cancel() {
        this.status = ApplicationStatus.CANCELLED;
    }
}