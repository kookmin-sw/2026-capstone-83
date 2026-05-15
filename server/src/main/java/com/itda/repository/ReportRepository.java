package com.itda.repository;

import com.itda.entity.Report;
import com.itda.enums.ReportStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ReportRepository extends JpaRepository<Report, Long> {

    // 전체 신고 목록 (페이지네이션)
    Page<Report> findAllByOrderByCreatedAtDesc(Pageable pageable);

    // 상태별 신고 목록
    Page<Report> findByStatusOrderByCreatedAtDesc(ReportStatus status, Pageable pageable);

    // 특정 유저에 대한 신고 횟수
    long countByTargetId(Long targetUserId);

    // 상태 + 신고 대상 이름/이메일 검색
    @Query("SELECT r FROM Report r JOIN r.target t " +
            "WHERE (:status IS NULL OR r.status = :status) " +
            "AND (:keyword IS NULL OR t.name LIKE %:keyword% OR t.email LIKE %:keyword%) " +
            "ORDER BY r.createdAt DESC")
    Page<Report> searchReports(
            @Param("status") ReportStatus status,
            @Param("keyword") String keyword,
            Pageable pageable);
}
