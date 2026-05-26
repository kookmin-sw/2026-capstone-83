package com.itda.repository;

import com.itda.entity.Application;
import com.itda.enums.ApplicationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.time.LocalDate;
import java.time.LocalDateTime;
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

    // 지원자별 지원 목록 (커서 페이지네이션) — JOIN FETCH로 N+1 방지
    @Query("""
        SELECT a FROM Application a
        JOIN FETCH a.jobPost jp
        JOIN FETCH jp.workplace wp
        WHERE a.applicantUser.id = :userId
          AND (:cursor IS NULL OR a.id < :cursor)
        ORDER BY a.id DESC
        """)
    List<Application> findByApplicantUserIdWithCursor(
            @Param("userId") Long userId,
            @Param("cursor") Long cursor,
            org.springframework.data.domain.Pageable pageable);

    // 근무 시간 겹침 체크 (workStartAt/workEndAt 범위 기준)
    @Query("""
    SELECT a FROM Application a
    WHERE a.status IN :statuses
      AND a.jobPost.workStartAt < :endAt
      AND a.jobPost.workEndAt > :startAt
    """)
    List<Application> findByJobPost_WorkRangeOverlapAndStatusIn(
            @Param("startAt") LocalDateTime startAt,
            @Param("endAt") LocalDateTime endAt,
            @Param("statuses") List<ApplicationStatus> statuses);
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

    // 구직자 근무 일정 조회 (다중 상태 + 기간 필터)
    List<Application> findByApplicantUserIdAndStatusInAndJobPost_WorkDateBetween(
            Long applicantUserId, List<ApplicationStatus> statuses, LocalDate from, LocalDate to
    );

    // 유저의 매칭 횟수 (HIRED + COMPLETED 건수)
    long countByApplicantUserIdAndStatusIn(Long applicantUserId, List<ApplicationStatus> statuses);

    /**
     * 자동 완료 처리 대상 조회
     * 오늘 근무하고, 근무 종료 시각이 지난 HIRED 상태 Application
     */
    @Query("""
    SELECT a FROM Application a
    WHERE a.status = 'HIRED'
      AND a.jobPost.workEndAt <= :now
    """)
    List<Application> findCompletableApplications(
            @Param("now") LocalDateTime now);
    // 근무 완료 후 7일 이내 리뷰 미작성 지원 조회 (자동 무난해요 처리용)
    @Query("""
    SELECT a FROM Application a
    WHERE a.status = 'COMPLETED'
      AND a.updatedAt < :deadline
      AND NOT EXISTS (
          SELECT r FROM Review r
          WHERE r.application.id = a.id
            AND r.target = 'EMPLOYER_TO_EMPLOYEE'
      )
    """)
    List<Application> findUnreviewedCompletedApplications(
            @Param("deadline") java.time.LocalDateTime deadline);
}