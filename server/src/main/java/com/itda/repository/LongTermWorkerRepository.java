package com.itda.repository;

import com.itda.entity.LongTermWorker;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
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

    /**
     * bulkOffer 용 배치 조회 — N+1 방지.
     * 주어진 applicantUserIds 중 고용주가 장기근무자로 등록한 구직자 ID 목록을 반환한다.
     */
    @Query("""
            SELECT l.applicantUser.id FROM LongTermWorker l
            WHERE l.employerUser.id = :employerUserId
              AND l.applicantUser.id IN :applicantUserIds
            """)
    List<Long> findApplicantUserIdsByEmployerAndApplicantsIn(
            @Param("employerUserId") Long employerUserId,
            @Param("applicantUserIds") List<Long> applicantUserIds);
}