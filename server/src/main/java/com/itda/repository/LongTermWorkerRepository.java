package com.itda.repository;

import com.itda.entity.LongTermWorker;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LongTermWorkerRepository extends JpaRepository<LongTermWorker, Long> {

    // 고용주+구직자 조합으로 장기근무 여부 확인
    Optional<LongTermWorker> findByEmployerUserIdAndApplicantUserId(Long employerUserId, Long applicantUserId);

    // 고용주가 장기근무로 등록한 구직자 목록
    List<LongTermWorker> findByEmployerUserId(Long employerUserId);

    // 장기근무 여부 확인
    boolean existsByEmployerUserIdAndApplicantUserId(Long employerUserId, Long applicantUserId);
}