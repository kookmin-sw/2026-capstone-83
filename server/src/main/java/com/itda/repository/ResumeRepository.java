package com.itda.repository;

import com.itda.entity.Resume;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.Optional;
import java.util.List;

@Repository
public interface ResumeRepository extends JpaRepository<Resume, Long> {

    // 유저 ID로 이력서 조회
    Optional<Resume> findByUserId(Long userId);

    // 커서 방식 페이지네이션
    List<Resume> findByIdGreaterThanOrderByIdAsc(Long cursor, org.springframework.data.domain.Pageable pageable);

    // 첫 페이지 (cursor 없을 때)
    List<Resume> findAllByOrderByIdAsc(org.springframework.data.domain.Pageable pageable);
    // 좋아요한 이력서 목록 조회 (커서 페이지네이션)

    @Query("SELECT r FROM Resume r WHERE r.id IN :ids " +
            "AND (:cursor IS NULL OR r.id > :cursor) " +
            "ORDER BY r.id ASC")
    List<Resume> findByIdInWithCursor(
            @Param("ids") List<Long> ids,
            @Param("cursor") Long cursor,
            org.springframework.data.domain.Pageable pageable);
}