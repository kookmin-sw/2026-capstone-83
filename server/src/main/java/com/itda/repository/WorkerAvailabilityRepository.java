package com.itda.repository;

import com.itda.entity.WorkerAvailability;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface WorkerAvailabilityRepository extends JpaRepository<WorkerAvailability, Long> {

    /**
     * 캘린더 범위 조회 — fromStart ~ toEnd 와 overlap 하는 슬롯 (자정 넘김 자연 포함).
     * overlap 조건: availStartAt &lt; toEnd AND availEndAt &gt; fromStart
     *
     * @param userId    구직자 ID
     * @param fromStart 조회 시작 일시 (exclusive lower bound: availEndAt &gt; fromStart)
     * @param toEnd     조회 종료 일시 (exclusive upper bound: availStartAt &lt; toEnd)
     */
    @Query("""
            SELECT w FROM WorkerAvailability w
            WHERE w.user.id = :userId
              AND w.availStartAt < :toEnd
              AND w.availEndAt   > :fromStart
            ORDER BY w.availStartAt ASC
            """)
    List<WorkerAvailability> findByUserIdAndRange(
            @Param("userId") Long userId,
            @Param("fromStart") LocalDateTime fromStart,
            @Param("toEnd") LocalDateTime toEnd);

    /**
     * 소유권 검증 포함 단건 조회.
     * 본인 슬롯이 아닌 경우 {@link Optional#empty()} 반환.
     *
     * @param id     레코드 PK
     * @param userId 요청자 User ID
     */
    Optional<WorkerAvailability> findByIdAndUserId(Long id, Long userId);

    /**
     * 시간 구간 겹침 검사 (열린 부등호 — 딱 붙어있는 슬롯은 허용).
     * 수정 시 자기 자신 제외 ({@code excludeId} null 이면 무시).
     *
     * @param userId    구직자 ID
     * @param newStart  신규 슬롯 시작 일시
     * @param newEnd    신규 슬롯 종료 일시
     * @param excludeId 수정 시 자기 자신 레코드 제외용 ID (신규 생성이면 null)
     */
    @Query("""
            SELECT w FROM WorkerAvailability w
            WHERE w.user.id = :userId
              AND w.availStartAt < :newEnd
              AND w.availEndAt   > :newStart
              AND (:excludeId IS NULL OR w.id <> :excludeId)
            """)
    List<WorkerAvailability> findOverlapping(
            @Param("userId") Long userId,
            @Param("newStart") LocalDateTime newStart,
            @Param("newEnd") LocalDateTime newEnd,
            @Param("excludeId") Long excludeId);

    /**
     * 매칭용 — JobPost 시간을 완전히 포함하고 희망 지역이 일치하는 구직자 ID 목록.
     * avail ⊇ post, minDuration 필터, 지역 필터, 자기 공고 제외.
     *
     * <p>preferred_districts 는 JSON 배열 텍스트로 저장되므로 {@code JSON_CONTAINS} 네이티브 함수로
     * workplaceDistrict 가 목록에 포함되는지 검사한다.
     *
     * @param postStartAt          공고 근무 시작 일시
     * @param postEndAt            공고 근무 종료 일시
     * @param postDurationMinutes  공고 근무 길이(분)
     * @param employerUserId       공고 등록 고용주 User ID (본인 제외)
     * @param workplaceDistrict    공고 사업장 행정구역 (시/구 단위)
     */
    @Query(value = """
            SELECT DISTINCT w.user_id FROM worker_availability w
            WHERE w.avail_start_at <= :postStartAt
              AND w.avail_end_at   >= :postEndAt
              AND w.min_duration_minutes <= :postDurationMinutes
              AND w.user_id <> :employerUserId
              AND JSON_CONTAINS(w.preferred_districts, JSON_QUOTE(:workplaceDistrict))
            """, nativeQuery = true)
    List<Long> findMatchingUserIdsForJobPost(
            @Param("postStartAt") LocalDateTime postStartAt,
            @Param("postEndAt") LocalDateTime postEndAt,
            @Param("postDurationMinutes") int postDurationMinutes,
            @Param("employerUserId") Long employerUserId,
            @Param("workplaceDistrict") String workplaceDistrict);
}
