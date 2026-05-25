package com.itda.repository;

import com.itda.entity.WorkerAvailability;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface WorkerAvailabilityRepository extends JpaRepository<WorkerAvailability, Long> {

    /**
     * 주간/월간 캘린더 뷰용 조회.
     * 날짜 오름차순, 같은 날짜 내에서는 시작시간 오름차순으로 반환한다.
     *
     * @param userId 구직자 ID
     * @param from   조회 시작 날짜 (포함)
     * @param to     조회 종료 날짜 (포함)
     */
    List<WorkerAvailability> findByUserIdAndDateBetweenOrderByDateAscStartTimeAsc(
            Long userId, LocalDate from, LocalDate to);

    /**
     * 동일 그룹(linkedGroupId)에 속하는 레코드 전체 조회.
     * 응답 조립(분할된 두 레코드를 하나의 DTO로 병합)과 그룹 단위 삭제에 사용한다.
     *
     * @param linkedGroupId 그룹 식별자 UUID
     */
    List<WorkerAvailability> findByLinkedGroupId(String linkedGroupId);

    /**
     * 여러 그룹의 레코드를 한 번의 IN 쿼리로 조회 (N+1 방지).
     * {@code getRange()} 에서 그룹 ID 목록을 모은 뒤 한 번에 조회할 때 사용한다.
     *
     * @param linkedGroupIds 조회할 그룹 ID 목록
     */
    List<WorkerAvailability> findByLinkedGroupIdInOrderByDateAscStartTimeAsc(
            Collection<String> linkedGroupIds);

    /**
     * 단건 조회 (소유권 검증 포함).
     * 자신의 레코드가 아닌 경우 {@link java.util.Optional#empty()}를 반환하므로
     * 호출자는 {@code orElseThrow(NotFoundException::new)} 패턴으로 소유권 검증을 겸한다.
     *
     * @param id     레코드 PK
     * @param userId 요청자 User ID
     */
    Optional<WorkerAvailability> findByIdAndUserId(Long id, Long userId);

    /**
     * 시간 구간 겹침 검사 — 같은 사용자의 기존 그룹들과 충돌하는 그룹 ID 목록 반환.
     *
     * <p>신규 [newStart, newEnd) 가 기존 [groupStartAt, groupEndAt) 와 반열린 구간(half-open)으로
     * 겹치면 해당 linkedGroupId 를 반환한다.
     *
     * <p>수정 요청 시 자기 자신 그룹을 제외하려면 {@code excludeGroupId} 에 기존 그룹 ID 를 전달하고,
     * 신규 생성이라면 {@code null} 을 전달한다.
     *
     * @param userId         구직자 ID
     * @param newStart       신규 그룹 시작 일시
     * @param newEnd         신규 그룹 종료 일시
     * @param excludeGroupId 수정 시 자기 자신 그룹 제외용 linkedGroupId (신규 생성이면 null)
     * @return 겹치는 linkedGroupId 목록 (비어 있으면 충돌 없음)
     */
    @Query("""
            SELECT DISTINCT w.linkedGroupId FROM WorkerAvailability w
            WHERE w.user.id = :userId
              AND w.groupStartAt < :newEnd
              AND w.groupEndAt > :newStart
              AND (:excludeGroupId IS NULL OR w.linkedGroupId <> :excludeGroupId)
            """)
    List<String> findOverlappingGroupIds(
            @Param("userId") Long userId,
            @Param("newStart") LocalDateTime newStart,
            @Param("newEnd") LocalDateTime newEnd,
            @Param("excludeGroupId") String excludeGroupId);

    /**
     * 매칭용 — 구직자의 가용시간 그룹 중 JobPost 시간대를 완전히 포함(avail ⊇ post)하는 그룹 ID 목록 반환.
     *
     * <p><b>매칭 조건:</b>
     * <ol>
     *   <li>{@code groupStartAt ≤ postStartAt}: 가용시간 그룹이 공고 시작 전에 시작한다.</li>
     *   <li>{@code groupEndAt ≥ postEndAt}: 가용시간 그룹이 공고 종료 이후까지 이어진다.</li>
     *   <li>{@code minDurationMinutes ≤ postDurationMinutes}: V1 노이즈 컷 —
     *       구직자가 원하는 최소 근무 길이보다 공고 길이가 짧으면 매칭 제외.</li>
     * </ol>
     *
     * @param userId               구직자 ID
     * @param postStartAt          JobPost 그룹 시작 일시
     * @param postEndAt            JobPost 그룹 종료 일시
     * @param postDurationMinutes  JobPost 근무 길이(분)
     * @return 매칭 후보 linkedGroupId 목록
     */
    @Query("""
            SELECT DISTINCT w.linkedGroupId FROM WorkerAvailability w
            WHERE w.user.id = :userId
              AND w.groupStartAt <= :postStartAt
              AND w.groupEndAt   >= :postEndAt
              AND w.minDurationMinutes <= :postDurationMinutes
            """)
    List<String> findMatchingGroupIdsForJobPost(
            @Param("userId") Long userId,
            @Param("postStartAt") LocalDateTime postStartAt,
            @Param("postEndAt") LocalDateTime postEndAt,
            @Param("postDurationMinutes") int postDurationMinutes);

    /**
     * 자동 매칭(공고 등록 트리거)용 — 새 공고 시간대를 완전히 포함하는 가용시간을 가진
     * 구직자 ID 목록을 반환한다.
     *
     * <p><b>매칭 조건:</b>
     * <ol>
     *   <li>{@code groupStartAt ≤ postStart}: 가용시간이 공고 시작 전에 시작한다.</li>
     *   <li>{@code groupEndAt ≥ postEnd}: 가용시간이 공고 종료 이후까지 이어진다.</li>
     *   <li>{@code minDurationMinutes ≤ postDurationMinutes}: 구직자가 원하는 최소 근무 시간 이상의 공고.</li>
     *   <li>{@code user.id ≠ employerUserId}: 공고 등록자 본인 제외.</li>
     * </ol>
     *
     * <p>같은 사용자가 여러 가용시간 그룹을 가지더라도 DISTINCT 로 한 번만 반환한다.
     *
     * @param postStart           공고 그룹 시작 일시
     * @param postEnd             공고 그룹 종료 일시
     * @param postDurationMinutes 공고 근무 길이(분)
     * @param employerUserId      공고 등록 고용주의 User ID (자기 자신 제외)
     * @return 매칭 구직자 User ID 목록 (중복 제거)
     */
    @Query("""
            SELECT DISTINCT w.user.id FROM WorkerAvailability w
            WHERE w.user.id <> :employerUserId
              AND w.groupStartAt <= :postStart
              AND w.groupEndAt   >= :postEnd
              AND w.minDurationMinutes <= :postDurationMinutes
            """)
    List<Long> findMatchingAvailabilityUserIds(
            @Param("postStart") LocalDateTime postStart,
            @Param("postEnd") LocalDateTime postEnd,
            @Param("postDurationMinutes") int postDurationMinutes,
            @Param("employerUserId") Long employerUserId);
}
