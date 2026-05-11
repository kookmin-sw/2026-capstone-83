package com.itda.repository;

import com.itda.entity.Career;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CareerRepository extends JpaRepository<Career, Long> {

    // 이력서 ID로 경력 목록 조회
    List<Career> findByResumeId(Long resumeId);
}