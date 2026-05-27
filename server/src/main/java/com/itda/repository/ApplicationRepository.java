package com.itda.repository;

import com.itda.entity.Application;
import com.itda.enums.ApplicationStatus;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, Long> {

    // ─── 기본 조회 ─────────────────────────────────────────────

    // 공고별 지원자 목록
    List<Application> findByJobPostId(Long jobPostId);

    // 지원자별 지원 목록
    List<Application> findByApplicantUserId(Long applicantUserId);

    // 중복 지원 체크
    Optional<Application> findByJobPostIdAndApplicantUserId(Long jobPostId, Long applicantUserId);

    // 공고별 특정 상태 지원자 목록
    List<Application> findByJobPostIdAndStatus(Long jobPostId, ApplicationStatus status);

    // 지원자별 특정 상태 목록
    List<Application> findByApplicantUserIdAndStatus(Long applicantUserId, ApplicationStatus status);

    // ─── 커서 페이지네이션 ──────────────────────────────────────

    /**
     * 지원자 본인의 지원 목록 — 커서 기반 페이지네이션 (내 지원 탭).
     * N+1 방지를 위해 jobPost, workplace 를 JOIN FETCH.
     * cursor = null 이면 처음부터 조회.
     */
    @Query("""
        SELECT a FROM Application a
        JOIN FETCH a.jobPost jp
        JOIN FETCH jp.workplace
        WHERE a.applicantUser.id = :userId
        AND (:cursor IS NULL OR a.id < :cursor)
        ORDER BY a.id DESC
        """)
    List<Application> findByApplicantUserIdWithCursor(
            @Param("userId") Long userId,
            @Param("cursor") Long cursor,
            Pageable pageable);

    /**
     * 공고별 지원자 목록 — 커서 기반 페이지네이션 (고용주 지원자 탭).
     * cursor = null 이면 처음부터 조회.
     */
    @Query("""
        SELECT a FROM Application a
        JOIN FETCH a.applicantUser
        WHERE a.jobPost.id = :jobPostId
        AND (:cursor IS NULL OR a.id < :cursor)
        ORDER BY a.id DESC
        """)
    List<Application> findByJobPostIdWithCursor(
            @Param("jobPostId") Long jobPostId,
            @Param("cursor") Long cursor,
            Pageable pageable);

    // ─── 캘린더 / 일정 조회 ─────────────────────────────────────

    /**
     * 구직자 근무 일정 조회 (캘린더).
     * 특정 날짜 범위 + 특정 상태 목록에 해당하는 지원 내역.
     */
    List<Application> findByApplicantUserIdAndStatusInAndJobPost_WorkDateBetween(
            Long applicantUserId,
            List<ApplicationStatus> statuses,
            LocalDate from,
            LocalDate to);

    // ─── 날짜/시간 겹침 체크 ────────────────────────────────────

    /**
     * 특정 근무일에 특정 상태인 지원 목록 (일괄 오퍼 시 날짜 충돌 제외용).
     */
    List<Application> findByJobPost_WorkDateAndStatusIn(
            LocalDate workDate,
            List<ApplicationStatus> statuses);

    /**
     * 근무 시간대가 겹치는 지원 목록 (오퍼 대상자 필터링용).
     * [startAt, endAt] 범위와 겹치는 JobPost 의 Application 조회.
     */
    @Query("""
        SELECT a FROM Application a
        WHERE a.jobPost.workStartAt < :endAt
          AND a.jobPost.workEndAt   > :startAt
          AND a.status IN :statuses
        """)
    List<Application> findByJobPost_WorkRangeOverlapAndStatusIn(
            @Param("startAt") LocalDateTime startAt,
            @Param("endAt")   LocalDateTime endAt,
            @Param("statuses") List<ApplicationStatus> statuses);

    // ─── 카운트 ────────────────────────────────────────────────

    // 누적 채용 횟수 (이력서 totalHired 산출용)
    long countByApplicantUserIdAndStatus(Long applicantUserId, ApplicationStatus status);

    /**
     * 지원자의 특정 상태 목록 건수 집계 (매칭 횟수 표시용).
     */
    long countByApplicantUserIdAndStatusIn(
            Long applicantUserId,
            List<ApplicationStatus> statuses);

    // ─── 스케줄러 전용 ──────────────────────────────────────────

    /**
     * 근무 완료 자동 처리 대상 조회.
     * HIRED 상태이며 workEndAt 이 현재 시각 이전인 Application.
     */
    @Query("""
        SELECT a FROM Application a
        WHERE a.status = com.itda.enums.ApplicationStatus.HIRED
          AND a.jobPost.workEndAt <= :now
        """)
    List<Application> findCompletableApplications(@Param("now") LocalDateTime now);

    /**
     * 자동 무난해요 처리 대상 조회.
     * COMPLETED 상태이며 workEndAt 이 deadline(= 7일 전) 이전이고
     * 고용주 → 구직자 방향의 리뷰가 아직 없는 Application.
     */
    @Query("""
        SELECT a FROM Application a
        WHERE a.status = com.itda.enums.ApplicationStatus.COMPLETED
          AND a.jobPost.workEndAt <= :deadline
          AND NOT EXISTS (
              SELECT r FROM Review r
              WHERE r.application = a
                AND r.target = com.itda.enums.ReviewTarget.EMPLOYER_TO_EMPLOYEE
          )
        """)
    List<Application> findUnreviewedCompletedApplications(@Param("deadline") LocalDateTime deadline);
}
