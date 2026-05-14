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

    // 고용주 공고 목록 조회
    @Query("SELECT j FROM JobPost j WHERE j.workplace.employer.id = :employerId")
    List<JobPost> findByEmployerId(@Param("employerId") Long employerId);

    // 고용주 공고 목록 조회 (커서 페이지네이션)
    @Query("SELECT j FROM JobPost j WHERE j.workplace.employer.id = :employerId " +
            "AND (:cursor IS NULL OR j.id < :cursor) " +
            "ORDER BY j.id DESC")
    List<JobPost> findByEmployerIdWithCursor(
            @Param("employerId") Long employerId,
            @Param("cursor") Long cursor,
            org.springframework.data.domain.Pageable pageable);

    // 캘린더용 날짜 범위 조회
    @Query("SELECT j FROM JobPost j WHERE j.workplace.employer.id = :employerId " +
            "AND j.workDate BETWEEN :start AND :end")
    List<JobPost> findByEmployerIdAndWorkDateBetween(
            @Param("employerId") Long employerId,
            @Param("start") LocalDate start,
            @Param("end") LocalDate end);
    // liked 공고 ID 목록 기준 조회
    @Query("SELECT j FROM JobPost j WHERE j.id IN :ids ORDER BY j.id DESC")
    List<JobPost> findByIdIn(@Param("ids") List<Long> ids);

    // 공고 목록 통합 필터 조회는 JobPostRepositoryCustom#findByDynamicFilter 로 위임.
}