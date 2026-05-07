package com.itda.repository;

import com.itda.entity.Application;
import com.itda.enums.ApplicationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.time.LocalDate;
import java.util.Optional;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, Long> {

    // 공고별 지원자 목록
    List<Application> findByJobPostId(Long jobPostId);

    // 공고별 지원자 목록 (커서 페이지네이션)
    @Query("SELECT a FROM Application a WHERE a.jobPost.id = :jobPostId " +
            "AND (:cursor IS NULL OR a.id < :cursor) " +
            "ORDER BY a.id DESC")
    List<Application> findByJobPostIdWithCursor(
            @Param("jobPostId") Long jobPostId,
            @Param("cursor") Long cursor,
            org.springframework.data.domain.Pageable pageable);

    // 지원자별 지원 목록
    List<Application> findByApplicantUserId(Long applicantUserId);

    // 지원자별 지원 목록 (커서 페이지네이션)
    @Query("SELECT a FROM Application a WHERE a.applicantUser.id = :userId " +
            "AND (:cursor IS NULL OR a.id < :cursor) " +
            "ORDER BY a.id DESC")
    List<Application> findByApplicantUserIdWithCursor(
            @Param("userId") Long userId,
            @Param("cursor") Long cursor,
            org.springframework.data.domain.Pageable pageable);

    // 중복 지원 체크
    Optional<Application> findByJobPostIdAndApplicantUserId(Long jobPostId, Long applicantUserId);

    // 공고별 특정 상태 지원자 목록
    List<Application> findByJobPostIdAndStatus(Long jobPostId, ApplicationStatus status);

    // 지원자별 특정 상태 목록
    List<Application> findByApplicantUserIdAndStatus(Long applicantUserId, ApplicationStatus status);

    // 구직자 근무 일정 조회 (HIRED 상태 + 기간 필터)
    List<Application> findByApplicantUserIdAndStatusAndJobPost_WorkDateBetween(
            Long applicantUserId, ApplicationStatus status, LocalDate from, LocalDate to
    );

    // 유저의 매칭 횟수 (HIRED + COMPLETED 건수)
    long countByApplicantUserIdAndStatusIn(Long applicantUserId, List<ApplicationStatus> statuses);
}
