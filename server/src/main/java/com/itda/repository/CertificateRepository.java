package com.itda.repository;

import com.itda.entity.Certificate;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CertificateRepository extends JpaRepository<Certificate, Long> {

    // 이력서 ID로 자격/인증 목록 조회
    List<Certificate> findByResumeId(Long resumeId);
}