package com.itda.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * 사업장 정보 Entity
 * 고용주(Employer) 1명이 여러 사업장을 가질 수 있음
 */
@Entity
@Table(name = "workplaces")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Workplace {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 사업장 소유 고용주 (employers 테이블 참조)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employer_id", nullable = false)
    private Employer employer;

    // 사업장 이름
    @Column(nullable = false, length = 100)
    private String name;

    // 회사명 (사업자등록증 기준)
    @Column(name = "company_name", nullable = false, length = 100)
    private String companyName;

    // 사업자등록번호
    @Column(name = "business_number", length = 20)
    private String businessNumber;

    // 사업장 주소 (공고 목록 근무지 표시에 사용)
    @Column(nullable = false, length = 255)
    private String address;

    // 회사 로고 이미지 S3 URL (공고 카드에 표시)
    @Column(name = "company_logo_url", length = 500)
    private String companyLogoUrl;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}