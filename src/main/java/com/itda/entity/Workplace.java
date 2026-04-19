package com.itda.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employer_id", nullable = false)
    private Employer employer;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(name = "company_name", nullable = false, length = 100)
    private String companyName;

    @Column(name = "business_number", length = 20)
    private String businessNumber;

    @Column(nullable = false, length = 255)
    private String address;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}