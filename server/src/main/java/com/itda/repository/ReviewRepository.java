package com.itda.repository;

import com.itda.entity.Review;
import com.itda.enums.ReviewTarget;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

    // ─── 존재 여부 확인 ───────────────────────────────────────

    // application + 방향으로 이미 작성한 리뷰가 있는지 확인
    boolean existsByApplicationIdAndTarget(Long applicationId, ReviewTarget target);

    // ─── 단건 조회 ───────────────────────────────────────────

    // application + 방향으로 리뷰 조회
    Optional<Review> findByApplicationIdAndTarget(Long applicationId, ReviewTarget target);

    // 사업장+구직자 조합으로 EMPLOYEE_TO_WORKPLACE 리뷰 조회 (upsert용)
    @Query("""
        SELECT r FROM Review r
        WHERE r.application.jobPost.workplace.id = :workplaceId
          AND r.application.applicantUser.id = :applicantUserId
          AND r.target = 'EMPLOYEE_TO_WORKPLACE'
        ORDER BY r.createdAt DESC
        """)
    Optional<Review> findEmployeeReviewByWorkplaceAndApplicant(
            @Param("workplaceId") Long workplaceId,
            @Param("applicantUserId") Long applicantUserId);

    // 고용주+구직자 조합으로 기존 리뷰 조회 (재리뷰 시 UPDATE용, LIMIT 1)
    @Query("""
    SELECT r FROM Review r
    WHERE r.reviewer.id = :reviewerId
      AND r.application.applicantUser.id = :applicantUserId
      AND r.target = 'EMPLOYER_TO_EMPLOYEE'
    ORDER BY r.createdAt DESC
    LIMIT 1
    """)
    Optional<Review> findByReviewerIdAndApplicantUserId(
            @Param("reviewerId") Long reviewerId,
            @Param("applicantUserId") Long applicantUserId);

    // ─── 목록 조회 ───────────────────────────────────────────

    // 특정 사업장에 달린 구직자→사업장 리뷰 목록
    @Query("""
        SELECT r FROM Review r
        WHERE r.application.jobPost.workplace.id = :workplaceId
          AND r.target = 'EMPLOYEE_TO_WORKPLACE'
        ORDER BY r.createdAt DESC
        """)
    List<Review> findWorkplaceReviews(@Param("workplaceId") Long workplaceId);

    // 특정 구직자에 달린 고용주→구직자 리뷰 목록
    @Query("""
        SELECT r FROM Review r
        WHERE r.application.applicantUser.id = :userId
          AND r.target = 'EMPLOYER_TO_EMPLOYEE'
        ORDER BY r.createdAt DESC
        """)
    List<Review> findEmployeeReviews(@Param("userId") Long userId);

    // 고용주+구직자 조합으로 EMPLOYER_TO_EMPLOYEE 리뷰 조회 (application 무관)
    @Query("""
        SELECT r FROM Review r
        WHERE r.reviewer.id = :employerUserId
          AND r.application.applicantUser.id = :applicantUserId
          AND r.target = 'EMPLOYER_TO_EMPLOYEE'
        ORDER BY r.createdAt DESC
        """)
    List<Review> findEmployerReviewByEmployerAndApplicant(
            @Param("employerUserId") Long employerUserId,
            @Param("applicantUserId") Long applicantUserId);

    // 고용주가 특정 구직자에게 작성한 리뷰 조회 (이력서 노출용)
    @Query("""
        SELECT r FROM Review r
        WHERE r.reviewer.id = :reviewerId
          AND r.application.applicantUser.id = :applicantUserId
          AND r.target = 'EMPLOYER_TO_EMPLOYEE'
        ORDER BY r.createdAt DESC
        """)
    List<Review> findByReviewerIdAndApplicantUserIdAll(
            @Param("reviewerId") Long reviewerId,
            @Param("applicantUserId") Long applicantUserId);

    // 내가 작성한 리뷰 목록
    List<Review> findByReviewerIdOrderByCreatedAtDesc(Long reviewerId);

    // 공고 삭제 시 연관 리뷰 일괄 삭제 (Application FK 제약 해제용)
    void deleteByApplicationIn(List<com.itda.entity.Application> applications);
}