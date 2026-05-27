package com.itda.repository;

import com.itda.entity.Application;
import com.itda.enums.ApplicationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.time.LocalDate;
import java.util.Optional;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, Long> {

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

    List<Application> findByApplicantUserIdAndStatusAndJobPost_WorkDateBetween(
            Long applicantUserId, ApplicationStatus status, LocalDate from, LocalDate to
    );

    // 누적 채용 횟수 (이력서 totalHired 산출용)
    long countByApplicantUserIdAndStatus(Long applicantUserId, ApplicationStatus status);
}