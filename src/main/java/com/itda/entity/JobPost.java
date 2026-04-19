package com.itda.entity;

import com.itda.enums.JobPostStatus;
import com.itda.enums.WageType;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "workplace_id", nullable = false)
    private Workplace workplace;

    @Column(nullable = false, length = 150)
    private String title;

    @Column(name = "s3_content_url", length = 500)
    private String s3ContentUrl;

    @Column(nullable = false)
    private Integer wage;

    @Enumerated(EnumType.STRING)
    @Column(name = "wage_type", nullable = false, length = 10)
    private WageType wageType;

    @Column(name = "work_date", nullable = false)
    private LocalDate workDate;

    @Column(name = "work_start", nullable = false)
    private LocalTime workStart;

    @Column(name = "work_end", nullable = false)
    private LocalTime workEnd;

    @Column(name = "total_slots", nullable = false)
    private Integer totalSlots;

    @Column(name = "filled_slots", nullable = false)
    @Builder.Default
    private Integer filledSlots = 0;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private JobPostStatus status;

    @Column(nullable = false)
    private LocalDate deadline;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}