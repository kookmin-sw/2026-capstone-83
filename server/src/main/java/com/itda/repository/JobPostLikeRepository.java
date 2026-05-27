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

}