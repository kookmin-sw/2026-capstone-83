package com.itda.repository;

import com.itda.entity.JobPost;
import com.itda.enums.JobPostStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import java.util.List;

public interface JobPostRepository extends JpaRepository<JobPost, Long>, JobPostRepositoryCustom {

    // 기존 메서드들
    List<JobPost> findByStatus(JobPostStatus status);
    List<JobPost> findByStatusOrderByWageDesc(JobPostStatus status);
    List<JobPost> findByStatusOrderByDeadlineAsc(JobPostStatus status);
    List<JobPost> findByStatusAndTitleContaining(JobPostStatus status, String keyword);

    // 사업장 단위 공고 개수 — 사업장 삭제 가능 여부 판단에 사용
    long countByWorkplaceId(Long workplaceId);

    // 고용주 공고 목록 조회 (user.id 기준)
    @Query("SELECT j FROM JobPost j WHERE j.workplace.employer.user.id = :userId")
    List<JobPost> findByEmployerId(@Param("userId") Long userId);

    // 고용주 공고 목록 조회 (커서 페이지네이션, user.id 기준)
    @Query("SELECT j FROM JobPost j WHERE j.workplace.employer.user.id = :userId " +
            "AND (:cursor IS NULL OR j.id < :cursor) " +
            "ORDER BY j.id DESC")
    List<JobPost> findByEmployerIdWithCursor(
            @Param("userId") Long userId,
            @Param("cursor") Long cursor,
            org.springframework.data.domain.Pageable pageable);
    // 고용주 공고 목록 조회 (커서 페이지네이션 + status 필터)
    @Query("SELECT j FROM JobPost j WHERE j.workplace.employer.user.id = :userId " +
            "AND j.status = :status " +
            "AND (:cursor IS NULL OR j.id < :cursor) " +
            "ORDER BY j.id DESC")
    List<JobPost> findByEmployerIdAndStatusWithCursor(
            @Param("userId") Long userId,
            @Param("status") JobPostStatus status,
            @Param("cursor") Long cursor,
            org.springframework.data.domain.Pageable pageable);
    // 고용주 공고 목록 조회 (OPEN + 특정 구직자와 연결된 공고 제외)
    @Query("SELECT j FROM JobPost j WHERE j.workplace.employer.user.id = :userId " +
            "AND j.status = com.itda.enums.JobPostStatus.OPEN " +
            "AND j.id NOT IN (SELECT a.jobPost.id FROM Application a WHERE a.applicantUser.id = :applicantUserId) " +
            "AND (:cursor IS NULL OR j.id < :cursor) " +
            "ORDER BY j.id DESC")
    List<JobPost> findOfferableByEmployerIdWithCursor(
            @Param("userId") Long userId,
            @Param("applicantUserId") Long applicantUserId,
            @Param("cursor") Long cursor,
            org.springframework.data.domain.Pageable pageable);

    // 캘린더용 날짜 범위 조회 (user.id 기준)
    @Query("SELECT j FROM JobPost j WHERE j.workplace.employer.user.id = :userId " +
            "AND j.workDate BETWEEN :start AND :end")
    List<JobPost> findByEmployerIdAndWorkDateBetween(
            @Param("userId") Long userId,
            @Param("start") LocalDate start,
            @Param("end") LocalDate end);
    // liked 공고 ID 목록 기준 조회
    @Query("SELECT j FROM JobPost j WHERE j.id IN :ids ORDER BY j.id DESC")
    List<JobPost> findByIdIn(@Param("ids") List<Long> ids);

    // 기간 만료된 OPEN 공고 조회 (스케줄러용)
    @Query("SELECT j FROM JobPost j WHERE j.status = com.itda.enums.JobPostStatus.OPEN AND j.deadline < :today")
    List<JobPost> findExpiredOpenPosts(@Param("today") LocalDate today);

    // 근무 시작 시간이 지난 OPEN 공고 조회 (당일 workDate + workStart < now)
    @Query("SELECT j FROM JobPost j WHERE j.status = com.itda.enums.JobPostStatus.OPEN " +
            "AND j.workDate = :today AND j.workStart < :now")
    List<JobPost> findStartedOpenPosts(@Param("today") LocalDate today, @Param("now") java.time.LocalTime now);

    /**
     * 랭킹용 후보 풀 조회 — OPEN 상태의 공고 중 사용자의 HIRED 공고는 제외.
     * 메모리에서 점수 매기기 위해 한 번에 가져온다.
     * excludeIds 가 비어 있을 수 있으므로 NULL 체크 패턴을 사용한다.
     */
    @Query("SELECT j FROM JobPost j " +
            "WHERE j.status = com.itda.enums.JobPostStatus.OPEN " +
            "AND (:excludeIds IS NULL OR j.id NOT IN :excludeIds)")
    List<JobPost> findOpenPostsExcluding(@Param("excludeIds") List<Long> excludeIds);

    // 공고 목록 통합 필터 조회는 JobPostRepositoryCustom#findByDynamicFilter 로 위임.
}