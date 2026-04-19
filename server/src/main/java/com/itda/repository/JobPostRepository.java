package com.itda.repository;

import com.itda.entity.JobPost;
import com.itda.enums.JobPostStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface JobPostRepository extends JpaRepository<JobPost, Long> {

    // 모집중인 공고 전체 조회
    List<JobPost> findByStatus(JobPostStatus status);

    // 급여 높은 순 정렬
    List<JobPost> findByStatusOrderByWageDesc(JobPostStatus status);

    // 날짜 범위 조회 (캘린더용)
    List<JobPost> findByWorkDateBetween(LocalDate start, LocalDate end);

    // 키워드 검색
    List<JobPost> findByStatusAndTitleContaining(JobPostStatus status, String keyword);

    // 마감 임박순 정렬
    List<JobPost> findByStatusOrderByDeadlineAsc(JobPostStatus status);

    // 사업장 ID로 조회 (고용주 캘린더용)
    List<JobPost> findByWorkplaceId(Long workplaceId);

    // 사업장 ID + 날짜 범위 (고용주 캘린더 월간/주간)
    List<JobPost> findByWorkplaceIdAndWorkDateBetween(Long workplaceId, LocalDate start, LocalDate end);

    // 고용주 전체 공고 조회
    @Query("SELECT j FROM JobPost j WHERE j.workplace.employer.id = :employerId")
    List<JobPost> findByEmployerId(Long employerId);

    // 고용주 공고 + 날짜 범위
    @Query("SELECT j FROM JobPost j WHERE j.workplace.employer.id = :employerId AND j.workDate BETWEEN :start AND :end")
    List<JobPost> findByEmployerIdAndWorkDateBetween(Long employerId, LocalDate start, LocalDate end);
}