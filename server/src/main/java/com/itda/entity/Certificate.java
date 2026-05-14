package com.itda.entity;

import com.itda.enums.CertificateType;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "certificates")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Certificate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 이력서 참조
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "resume_id", nullable = false)
    private Resume resume;

    // 자격/인증 종류 (Enum)
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CertificateType type;

    // 자격증 사본 이미지 S3 URL (옵셔널)
    @Column(name = "image_url", length = 500)
    private String imageUrl;
}