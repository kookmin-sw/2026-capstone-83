package com.itda.service;

import com.itda.dto.request.WorkerAvailabilityCreateRequest;
import com.itda.dto.request.WorkerAvailabilityUpdateRequest;
import com.itda.dto.response.WorkerAvailabilityResponse;
import com.itda.entity.User;
import com.itda.entity.WorkerAvailability;
import com.itda.enums.UserRole;
import com.itda.exception.DuplicateException;
import com.itda.exception.NotFoundException;
import com.itda.repository.WorkerAvailabilityRepository;
import com.itda.service.event.AutoMatchEvents;
import com.itda.service.util.TimeSlotSplitter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class WorkerAvailabilityService {

    private final WorkerAvailabilityRepository availabilityRepository;
    private final ApplicationEventPublisher eventPublisher;

    // ─── 생성 ────────────────────────────────────────────────────

    /**
     * 가용시간 슬롯 생성.
     *
     * <ol>
     *   <li>APPLICANT 역할 검증</li>
     *   <li>과거 시점 검증 — {@code startAt < now} 이면 거부</li>
     *   <li>{@link TimeSlotSplitter#split} 위임 — 자정 분할 / 유효성 검사 (IAE → ISE 매핑)</li>
     *   <li>겹침 검증 — {@code findOverlappingGroupIds} 에 결과 있으면 {@link DuplicateException}</li>
     *   <li>분할 Slice 별 저장 — 같은 {@code linkedGroupId} / {@code groupStartAt} / {@code groupEndAt}</li>
     *   <li>자동 매칭 이벤트 발행 — {@link AutoMatchEvents.AvailabilityCreatedEvent}</li>
     * </ol>
     *
     * @return 생성된 그룹의 응답 DTO
     */
    @Transactional
    public WorkerAvailabilityResponse create(User user, WorkerAvailabilityCreateRequest req) {
        verifyApplicantRole(user);
        verifyNotPast(req.startAt());

        TimeSlotSplitter.Split split = splitOrThrow(req.startAt(), req.endAt());

        verifyNoOverlap(user.getId(), req.startAt(), req.endAt(), null);

        List<WorkerAvailability> saved = saveGroup(user, split, req.getMinDurationMinutes());
        WorkerAvailabilityResponse response = WorkerAvailabilityResponse.fromGroup(saved);

        eventPublisher.publishEvent(new AutoMatchEvents.AvailabilityCreatedEvent(
                user.getId(),
                response.linkedGroupId(),
                response.startAt(),
                response.endAt(),
                response.minDurationMinutes()));

        return response;
    }

    // ─── 수정 ────────────────────────────────────────────────────

    /**
     * 가용시간 슬롯 수정 (전체 교체 방식).
     *
     * <p>내부적으로는 기존 그룹을 삭제하고 새 그룹으로 재생성한다.
     * 클라이언트 식별자인 {@code linkedGroupId} 는 기존 값을 그대로 유지한다 —
     * 클라이언트는 응답의 {@code linkedGroupId} 를 갱신할 필요가 없다.
     *
     * <ol>
     *   <li>APPLICANT 역할 검증</li>
     *   <li>존재·소유권 검증</li>
     *   <li>분할 처리 / 겹침 검증 (자기 자신 그룹 제외)</li>
     *   <li>기존 그룹 전체 삭제 → 기존 linkedGroupId 를 유지하여 새 그룹 저장</li>
     *   <li>자동 매칭 이벤트 발행 — 갱신된 시간대로 재탐색</li>
     * </ol>
     *
     * @param id  수정할 레코드의 DB PK (그룹 내 어느 레코드 ID 든 그룹 전체에 작용)
     * @return 새 그룹의 응답 DTO (linkedGroupId 는 기존과 동일)
     */
    @Transactional
    public WorkerAvailabilityResponse update(User user, Long id, WorkerAvailabilityUpdateRequest req) {
        verifyApplicantRole(user);

        WorkerAvailability target = findAndVerifyOwnership(id, user);
        String oldGroupId = target.getLinkedGroupId();

        TimeSlotSplitter.Split newSplit = splitOrThrow(req.startAt(), req.endAt());

        // 겹침 검증 — 자기 자신 그룹(oldGroupId)은 제외
        verifyNoOverlap(user.getId(), req.startAt(), req.endAt(), oldGroupId);

        // 기존 그룹 전체 삭제
        List<WorkerAvailability> oldGroup = availabilityRepository.findByLinkedGroupId(oldGroupId);
        availabilityRepository.deleteAll(oldGroup);

        // 기존 linkedGroupId 를 유지하여 새 그룹 저장 (Pre-correction 0-1)
        List<WorkerAvailability> newGroup = saveGroup(user, newSplit, req.getMinDurationMinutes(), oldGroupId);
        WorkerAvailabilityResponse response = WorkerAvailabilityResponse.fromGroup(newGroup);

        eventPublisher.publishEvent(new AutoMatchEvents.AvailabilityCreatedEvent(
                user.getId(),
                response.linkedGroupId(),
                response.startAt(),
                response.endAt(),
                response.minDurationMinutes()));

        return response;
    }

    // ─── 삭제 ────────────────────────────────────────────────────

    /**
     * 가용시간 슬롯 삭제 (그룹 전체).
     *
     * @param id 삭제할 레코드의 DB PK (그룹 내 어느 레코드 ID 든 그룹 전체를 삭제)
     */
    @Transactional
    public void delete(User user, Long id) {
        verifyApplicantRole(user);

        WorkerAvailability target = findAndVerifyOwnership(id, user);

        // 자정 분할된 경우 Day1·Day2 모두 삭제
        List<WorkerAvailability> groupRecords =
                availabilityRepository.findByLinkedGroupId(target.getLinkedGroupId());
        availabilityRepository.deleteAll(groupRecords);
    }

    // ─── 캘린더 범위 조회 ─────────────────────────────────────────

    /**
     * 날짜 범위 내 가용시간 슬롯 목록 조회 (그룹 단위 응답).
     *
     * <p>자정 분할된 그룹이 범위 경계에 걸쳐 있을 때(Day1 만 범위 안, Day2 가 범위 밖) 도
     * 그룹 전체를 포함하여 반환한다. 이를 위해:
     * <ol>
     *   <li>날짜 범위로 1차 조회</li>
     *   <li>고유 linkedGroupId 추출</li>
     *   <li>단일 IN 쿼리로 그룹 전체 레코드 일괄 조회 (N+1 방지 — Pre-correction 0-2)</li>
     *   <li>groupId 기준 그룹화 → DTO 조립</li>
     * </ol>
     *
     * @param fromDate 조회 시작 날짜 (포함)
     * @param toDate   조회 종료 날짜 (포함)
     * @return groupStartAt 오름차순으로 정렬된 그룹 목록
     */
    public List<WorkerAvailabilityResponse> getRange(User user, LocalDate fromDate, LocalDate toDate) {
        verifyApplicantRole(user);

        List<WorkerAvailability> rangeRecords =
                availabilityRepository.findByUserIdAndDateBetweenOrderByDateAscStartTimeAsc(
                        user.getId(), fromDate, toDate);

        if (rangeRecords.isEmpty()) {
            return List.of();
        }

        // 고유 groupId 를 발견 순서 유지로 추출
        List<String> groupIds = rangeRecords.stream()
                .map(WorkerAvailability::getLinkedGroupId)
                .distinct()
                .toList();

        // 단일 IN 쿼리로 모든 그룹 레코드 일괄 조회 (N+1 → 1 쿼리)
        List<WorkerAvailability> allGroupRecords =
                availabilityRepository.findByLinkedGroupIdInOrderByDateAscStartTimeAsc(groupIds);

        // groupId 기준으로 그룹화하여 DTO 조립
        Map<String, List<WorkerAvailability>> byGroupId = allGroupRecords.stream()
                .collect(Collectors.groupingBy(WorkerAvailability::getLinkedGroupId));

        return byGroupId.values().stream()
                .map(WorkerAvailabilityResponse::fromGroup)
                .sorted(Comparator.comparing(WorkerAvailabilityResponse::startAt))
                .toList();
    }

    // ─── private helpers ─────────────────────────────────────────

    /** APPLICANT 역할 검증 — APPLICANT 가 아니면 AccessDeniedException. */
    private static void verifyApplicantRole(User user) {
        if (user.getRole() != UserRole.APPLICANT) {
            throw new AccessDeniedException("구직자만 가용시간을 관리할 수 있습니다.");
        }
    }

    /**
     * 과거 시점 검증 — {@code startAt} 이 현재 시각보다 이전이면 거부.
     * 분 단위까지 비교 (초 단위 오차는 허용).
     */
    private static void verifyNotPast(LocalDateTime startAt) {
        if (startAt.isBefore(LocalDateTime.now())) {
            throw new IllegalStateException("과거 시점에 가용시간을 등록할 수 없습니다.");
        }
    }

    /**
     * {@link TimeSlotSplitter#split} 을 호출하고 {@link IllegalArgumentException} 을
     * 사용자 친화적인 {@link IllegalStateException} 으로 매핑한다.
     */
    private static TimeSlotSplitter.Split splitOrThrow(LocalDateTime startAt, LocalDateTime endAt) {
        try {
            return TimeSlotSplitter.split(startAt, endAt);
        } catch (IllegalArgumentException e) {
            throw new IllegalStateException("가용시간 범위가 올바르지 않습니다: " + e.getMessage());
        }
    }

    /**
     * 겹침 검증 — 같은 사용자의 기존 그룹과 시간대가 겹치면 {@link DuplicateException}.
     *
     * @param excludeGroupId 수정 시 자기 자신 그룹 제외용 (생성이면 null)
     */
    private void verifyNoOverlap(Long userId, LocalDateTime startAt, LocalDateTime endAt,
                                 String excludeGroupId) {
        List<String> overlapping =
                availabilityRepository.findOverlappingGroupIds(userId, startAt, endAt, excludeGroupId);
        if (!overlapping.isEmpty()) {
            throw new DuplicateException("같은 시간대에 이미 가용시간이 있습니다.");
        }
    }

    /**
     * 레코드 단건 조회 + 소유권 검증.
     *
     * @throws NotFoundException    해당 ID 의 레코드가 없을 때
     * @throws AccessDeniedException 레코드가 존재하지만 본인 소유가 아닐 때
     */
    private WorkerAvailability findAndVerifyOwnership(Long id, User user) {
        WorkerAvailability target = availabilityRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("가용시간 슬롯을 찾을 수 없습니다."));
        // Hibernate proxy 에서 ID 비교 — LAZY 로드 없이 프록시 ID 를 직접 비교
        if (!target.getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("본인의 가용시간만 수정/삭제할 수 있습니다.");
        }
        return target;
    }

    /**
     * Split 결과를 이용해 {@link WorkerAvailability} 레코드를 생성·저장한다.
     *
     * @param overrideGroupId null 이면 {@code split.linkedGroupId()} 를 사용하고,
     *                        non-null 이면 해당 값을 linkedGroupId 로 사용한다
     *                        (수정 시 기존 ID 유지 — Pre-correction 0-1).
     * @return 저장된 레코드 목록 (Day1 = index 0)
     */
    private List<WorkerAvailability> saveGroup(User user, TimeSlotSplitter.Split split,
                                               int minDurationMinutes, String overrideGroupId) {
        String groupId = (overrideGroupId != null) ? overrideGroupId : split.linkedGroupId();
        List<WorkerAvailability> entities = split.slices().stream()
                .map(slice -> WorkerAvailability.builder()
                        .user(user)
                        .date(slice.date())
                        .startTime(slice.startTime())
                        .endTime(slice.endTime())
                        .linkedGroupId(groupId)
                        .groupStartAt(split.groupStartAt())
                        .groupEndAt(split.groupEndAt())
                        .minDurationMinutes(minDurationMinutes)
                        .build())
                .toList();
        return availabilityRepository.saveAll(entities);
    }

    /** overrideGroupId = null 인 단축 오버로드. */
    private List<WorkerAvailability> saveGroup(User user, TimeSlotSplitter.Split split,
                                               int minDurationMinutes) {
        return saveGroup(user, split, minDurationMinutes, null);
    }
}
