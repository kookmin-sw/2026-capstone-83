package com.itda.entity;

import jakarta.persistence.*;
import lombok.*;

// 구직자 경력사항 엔티티 (이력서 1개당 여러 경력 가능)
@Entity
@Table(name = "careers")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Career {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 소속 이력서 (resumes 테이블 참조)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "resume_id", nullable = false)
    private Resume resume;

    // 담당 업무명 (ex. 물류 센터 하차)
    @Column(name = "job_title", nullable = false)
    private String jobTitle;

    // 근무 기간 - 년
    @Column(nullable = false)
    private int years;

    // 근무 기간 - 개월
    @Column(nullable = false)
    private int months;
}