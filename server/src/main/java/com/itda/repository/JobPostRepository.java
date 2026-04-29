package com.itda.repository;

import com.itda.entity.JobPost;
import com.itda.enums.JobPostStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import java.util.List;

public interface JobPostRepository extends JpaRepository<JobPost, Long> {

    // 기존 메서드들
    List<JobPost> findByStatus(JobPostStatus status);
    List<JobPost> findByStatusOrderByWageDesc(JobPostStatus status);
    List<JobPost> findByStatusOrderByDeadlineAsc(JobPostStatus status);
    List<JobPost> findByStatusAndTitleContaining(JobPostStatus status, String keyword);

    // 고용주 공고 목록 조회
    @Query("SELECT j FROM JobPost j WHERE j.workplace.employer.id = :employerId")
    List<JobPost> findByEmployerId(@Param("employerId") Long employerId);

    // 캘린더용 날짜 범위 조회
    @Query("SELECT j FROM JobPost j WHERE j.workplace.employer.id = :employerId " +
            "AND j.workDate BETWEEN :start AND :end")
    List<JobPost> findByEmployerIdAndWorkDateBetween(
            @Param("employerId") Long employerId,
            @Param("start") LocalDate start,
            @Param("end") LocalDate end);

    /**
     * 공고 목록 통합 필터 조회 (커서 방식 페이지네이션)
     * JobPostFilterRequest의 모든 필터 조건을 하나의 쿼리로 처리
     */
    @Query("SELECT j FROM JobPost j " +
            "WHERE j.status = 'OPEN' " +
            "AND (:cursor IS NULL OR j.id < :cursor) " +
            "AND (:keyword IS NULL OR j.title LIKE %:keyword%) " +
            "AND (:jobCategory IS NULL OR j.jobCategory = :jobCategory) " +
            "AND (:jobSubcategory IS NULL OR j.jobSubcategory = :jobSubcategory) " +
            "AND (:location IS NULL OR j.workplace.address LIKE %:location%) " +
            "AND (:workDate IS NULL OR CAST(j.workDate AS string) = :workDate) " +
            "ORDER BY " +
            "CASE WHEN :sortType = 'WAGE' THEN j.wage END DESC, " +
            "CASE WHEN :sortType = 'DEADLINE' THEN j.deadline END ASC, " +
            "j.id DESC")
    List<JobPost> findByFilter(
            @Param("cursor") Long cursor,
            @Param("keyword") String keyword,
            @Param("jobCategory") String jobCategory,
            @Param("jobSubcategory") String jobSubcategory,
            @Param("location") String location,
            @Param("workDate") String workDate,
            @Param("sortType") String sortType,
            org.springframework.data.domain.Pageable pageable);
}