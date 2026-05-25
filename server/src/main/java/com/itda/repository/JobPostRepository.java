package com.itda.repository;

import com.itda.entity.JobPost;
import com.itda.enums.JobPostStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import java.time.LocalDateTime;
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
    // 좋아요한 공고 목록 조회 (커서 페이지네이션)
    @Query("SELECT j FROM JobPost j WHERE j.id IN :ids " +
            "AND (:cursor IS NULL OR j.id < :cursor) " +
            "ORDER BY j.id DESC")
    List<JobPost> findByIdInWithCursor(
            @Param("ids") List<Long> ids,
            @Param("cursor") Long cursor,
            org.springframework.data.domain.Pageable pageable);
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

    /**
     * 같은 그룹(linkedGroupId)에 속하는 JobPost 전체 조회.
     * 자정 분할된 공고의 마감·삭제·그룹 단위 조회에 사용한다.
     *
     * @param linkedGroupId 그룹 식별자 UUID
     */
    List<JobPost> findByLinkedGroupId(String linkedGroupId);

    /**
     * 자동 매칭(가용시간 등록 트리거)용 — 구직자 가용시간 범위에 완전히 포함되는
     * OPEN 공고의 linkedGroupId 목록을 반환한다.
     *
     * <p><b>매칭 조건 (avail ⊇ post):</b>
     * <ol>
     *   <li>{@code groupStartAt ≥ availStart}: 공고가 가용시간 시작 이후에 시작한다.</li>
     *   <li>{@code groupEndAt ≤ availEnd}: 공고가 가용시간 종료 이전에 끝난다.</li>
     *   <li>{@code status = OPEN}: 모집 중인 공고만 대상.</li>
     *   <li>{@code employer.user.id ≠ userId}: 가용시간 등록자 본인 공고 제외.</li>
     * </ol>
     *
     * <p>minDurationMinutes 필터는 공고 그룹마다 적용할 구직자별 값이 다르므로
     * Java 레이어에서 처리한다.
     *
     * @param availStart 가용시간 그룹 시작 일시
     * @param availEnd   가용시간 그룹 종료 일시
     * @param userId     가용시간 등록 구직자 User ID (본인 공고 제외)
     * @return 매칭 후보 linkedGroupId 목록 (중복 제거)
     */
    @Query("""
            SELECT DISTINCT j.linkedGroupId FROM JobPost j
            WHERE j.status = com.itda.enums.JobPostStatus.OPEN
              AND j.groupStartAt >= :availStart
              AND j.groupEndAt   <= :availEnd
              AND j.workplace.employer.user.id <> :userId
            """)
    List<String> findMatchingJobPostGroupIdsForAvailability(
            @Param("availStart") LocalDateTime availStart,
            @Param("availEnd") LocalDateTime availEnd,
            @Param("userId") Long userId);
}