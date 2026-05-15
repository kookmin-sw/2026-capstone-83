package com.itda.entity;

import com.itda.enums.ReportReason;
import com.itda.enums.ReportStatus;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "reports")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Report {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 신고자
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reporter_user_id", nullable = false)
    private User reporter;

    // 신고 대상
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "target_user_id", nullable = false)
    private User target;

    // 신고 이유 (태그)
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private ReportReason reason;

    // 상세 신고 내용
    @Column(length = 1000)
    private String detail;

    // 처리 상태
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 15)
    private ReportStatus status;

    // 매니저 처리 메모
    @Column(name = "admin_note", length = 500)
    private String adminNote;

    // 신고 일시
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    // 처리 완료 일시
    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.status = ReportStatus.PENDING;
    }

    public void updateStatus(ReportStatus status, String adminNote) {
        this.status = status;
        this.adminNote = adminNote;
        if (status == ReportStatus.RESOLVED) {
            this.resolvedAt = LocalDateTime.now();
        }
    }
}
