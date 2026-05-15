package com.itda.repository;

import com.itda.entity.ResumeLike;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ResumeLikeRepository extends JpaRepository<ResumeLike, Long> {

    // 좋아요 여부 확인
    Optional<ResumeLike> findByEmployerUserIdAndResumeId(Long employerUserId, Long resumeId);

    // 고용주가 좋아요한 이력서 ID 목록
    List<ResumeLike> findByEmployerUserId(Long employerUserId);

    // 특정 이력서를 좋아요한 employer 목록 (랭킹 시 '내 이력서에 관심 보인 employer' 역추적용)
    List<ResumeLike> findByResumeId(Long resumeId);

    boolean existsByEmployerUserIdAndResumeId(Long employerUserId, Long resumeId);

}