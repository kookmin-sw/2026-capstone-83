package com.itda.repository;

import com.itda.entity.JobPostLike;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface JobPostLikeRepository extends JpaRepository<JobPostLike, Long> {

    // 좋아요 여부 확인
    Optional<JobPostLike> findByUserIdAndJobPostId(Long userId, Long jobPostId);

    // 유저가 좋아요한 공고 ID 목록
    List<JobPostLike> findByUserId(Long userId);

    boolean existsByUserIdAndJobPostId(Long userId, Long jobPostId);

    // 공고 삭제 시 연관 좋아요 일괄 삭제
    void deleteByJobPostId(Long jobPostId);

    // 고용주의 공고에 좋아요를 누른 구직자 목록 (우선 제안 대상 산출용)
    @org.springframework.data.jpa.repository.Query("""
        SELECT jl FROM JobPostLike jl
        WHERE jl.jobPost.workplace.employer.user.id = :employerUserId
        """)
    List<JobPostLike> findByEmployerUserId(
            @org.springframework.data.repository.query.Param("employerUserId") Long employerUserId);

}