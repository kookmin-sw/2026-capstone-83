package com.itda.repository;

import com.itda.entity.Resume;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface ResumeRepository extends JpaRepository<Resume, Long> {

    // 유저 ID로 이력서 조회
    Optional<Resume> findByUserId(Long userId);
}