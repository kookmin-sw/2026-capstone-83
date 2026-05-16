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

    /** application + 방향으로 이미 작성한 리뷰가 있는지 확인 */
    boolean existsByApplicationIdAndTarget(Long applicationId, ReviewTarget target);

    /** application + 방향으로 리뷰 조회 */
    Optional<Review> findByApplicationIdAndTarget(Long applicationId, ReviewTarget target);

    /** 특정 사업장에 달린 구직자→사업장 리뷰 목록 (공고 → workplace 연결) */
    @Query("""
        SELECT r FROM Review r
        WHERE r.application.jobPost.workplace.id = :workplaceId
          AND r.target = 'EMPLOYEE_TO_WORKPLACE'
        ORDER BY r.createdAt DESC
        """)
    List<Review> findWorkplaceReviews(@Param("workplaceId") Long workplaceId);

    /** 특정 구직자에 달린 고용주→구직자 리뷰 목록 */
    @Query("""
        SELECT r FROM Review r
        WHERE r.application.applicantUser.id = :userId
          AND r.target = 'EMPLOYER_TO_EMPLOYEE'
        ORDER BY r.createdAt DESC
        """)
    List<Review> findEmployeeReviews(@Param("userId") Long userId);

    /** 내가 작성한 리뷰 목록 */
    List<Review> findByReviewerIdOrderByCreatedAtDesc(Long reviewerId);
}
