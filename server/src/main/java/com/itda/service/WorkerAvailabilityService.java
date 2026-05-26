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
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

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
     *   <li>과거 시점 검증 — startAt &lt; now 이면 거부</li>
     *   <li>endAt &le; startAt 검증 → IllegalStateException</li>
     *   <li>24시간 초과 검증 → IllegalStateException</li>
     *   <li>겹침 검증 — {@code findOverlapping} 에 결과 있으면 {@link DuplicateException}</li>
     *   <li>단일 레코드 저장</li>
     *   <li>자동 매칭 이벤트 발행</li>
     * </ol>
     *
     * @return 생성된 슬롯의 응답 DTO
     */
    @Transactional
    public WorkerAvailabilityResponse create(User user, WorkerAvailabilityCreateRequest req) {
        verifyApplicantRole(user);
        verifyNotPast(req.startAt());
        verifyRange(req.startAt(), req.endAt());
        verifyNoOverlap(user.getId(), req.startAt(), req.endAt(), null);

        WorkerAvailability slot = WorkerAvailability.builder()
                .user(user)
                .availStartAt(req.startAt())
                .availEndAt(req.endAt())
                .minDurationMinutes(req.getMinDurationMinutes())
                .build();
        WorkerAvailability saved = availabilityRepository.save(slot);

        WorkerAvailabilityResponse response = WorkerAvailabilityResponse.from(saved);

        eventPublisher.publishEvent(new AutoMatchEvents.AvailabilityCreatedEvent(
                user.getId(),
                saved.getId(),
                saved.getAvailStartAt(),
                saved.getAvailEndAt(),
                saved.getMinDurationMinutes()));

        return response;
    }

    // ─── 수정 ────────────────────────────────────────────────────

    /**
     * 가용시간 슬롯 수정 (단순 필드 업데이트).
     *
     * <p>기존 ID 를 보존하면서 시간·minDuration 만 교체한다. delete+insert 방식 아님.
     *
     * <ol>
     *   <li>APPLICANT 역할 검증</li>
     *   <li>존재·소유권 검증</li>
     *   <li>endAt &le; startAt / 24시간 초과 검증</li>
     *   <li>겹침 검증 (자기 자신 제외)</li>
     *   <li>새 값으로 저장 (id 유지)</li>
     *   <li>자동 매칭 이벤트 발행 — 시간 바뀌면 재매칭</li>
     * </ol>
     *
     * @param id 수정할 슬롯 DB PK
     * @return 수정된 슬롯의 응답 DTO
     */
    @Transactional
    public WorkerAvailabilityResponse update(User user, Long id, WorkerAvailabilityUpdateRequest req) {
        verifyApplicantRole(user);

        WorkerAvailability existing = findOwnedSlot(user, id);

        verifyRange(req.startAt(), req.endAt());
        verifyNoOverlap(user.getId(), req.startAt(), req.endAt(), existing.getId());

        WorkerAvailability updated = WorkerAvailability.builder()
                .id(existing.getId())
                .user(existing.getUser())
                .availStartAt(req.startAt())
                .availEndAt(req.endAt())
                .minDurationMinutes(req.getMinDurationMinutes())
                .createdAt(existing.getCreatedAt())
                .build();
        WorkerAvailability saved = availabilityRepository.save(updated);

        WorkerAvailabilityResponse response = WorkerAvailabilityResponse.from(saved);

        eventPublisher.publishEvent(new AutoMatchEvents.AvailabilityCreatedEvent(
                user.getId(),
                saved.getId(),
                saved.getAvailStartAt(),
                saved.getAvailEndAt(),
                saved.getMinDurationMinutes()));

        return response;
    }

    // ─── 삭제 ────────────────────────────────────────────────────

    /**
     * 가용시간 슬롯 단건 삭제.
     *
     * @param id 삭제할 슬롯 DB PK
     */
    @Transactional
    public void delete(User user, Long id) {
        verifyApplicantRole(user);
        WorkerAvailability slot = findOwnedSlot(user, id);
        availabilityRepository.delete(slot);
    }

    // ─── 캘린더 범위 조회 ─────────────────────────────────────────

    /**
     * 날짜 범위 내 가용시간 슬롯 목록 조회.
     *
     * <p>overlap 쿼리를 사용하므로 야간 슬롯이 범위 경계에 걸쳐 있어도 자연스럽게 포함된다.
     *
     * @param fromDate 조회 시작 날짜 (포함)
     * @param toDate   조회 종료 날짜 (포함)
     * @return availStartAt 오름차순으로 정렬된 슬롯 목록
     */
    public List<WorkerAvailabilityResponse> getRange(User user, LocalDate fromDate, LocalDate toDate) {
        verifyApplicantRole(user);

        LocalDateTime fromStart = fromDate.atStartOfDay();
        LocalDateTime toEnd = toDate.plusDays(1).atStartOfDay(); // exclusive upper bound

        return availabilityRepository.findByUserIdAndRange(user.getId(), fromStart, toEnd)
                .stream()
                .map(WorkerAvailabilityResponse::from)
                .toList();
    }

    // ─── private helpers ─────────────────────────────────────────

    /** APPLICANT 역할 검증 — APPLICANT 가 아니면 AccessDeniedException. */
    private static void verifyApplicantRole(User user) {
        if (user.getRole() != UserRole.APPLICANT) {
            throw new AccessDeniedException("구직자만 가용시간을 관리할 수 있습니다.");
        }
    }

    /** 과거 시점 검증 — startAt 이 현재 시각보다 이전이면 거부. */
    private static void verifyNotPast(LocalDateTime startAt) {
        if (startAt.isBefore(LocalDateTime.now())) {
            throw new IllegalStateException("과거 시점에 가용시간을 등록할 수 없습니다.");
        }
    }

    /**
     * 범위 유효성 검증.
     *
     * @throws IllegalStateException endAt &le; startAt 이거나 24시간 이상인 경우
     */
    private static void verifyRange(LocalDateTime startAt, LocalDateTime endAt) {
        if (!endAt.isAfter(startAt)) {
            throw new IllegalStateException("종료 일시는 시작 일시보다 이후여야 합니다.");
        }
        if (Duration.between(startAt, endAt).toHours() >= 24) {
            throw new IllegalStateException("가용시간은 24시간 미만이어야 합니다.");
        }
    }

    /**
     * 겹침 검증 — 같은 사용자의 기존 슬롯과 시간대가 겹치면 {@link DuplicateException}.
     *
     * @param excludeId 수정 시 자기 자신 제외용 ID (생성이면 null)
     */
    private void verifyNoOverlap(Long userId, LocalDateTime startAt, LocalDateTime endAt,
                                 Long excludeId) {
        List<WorkerAvailability> overlapping =
                availabilityRepository.findOverlapping(userId, startAt, endAt, excludeId);
        if (!overlapping.isEmpty()) {
            throw new DuplicateException("같은 시간대에 이미 가용시간이 있습니다.");
        }
    }

    /**
     * 슬롯 단건 조회 + 소유권 검증.
     *
     * @throws NotFoundException     해당 ID 의 레코드가 없을 때
     * @throws AccessDeniedException 레코드가 존재하지만 본인 소유가 아닐 때
     */
    private WorkerAvailability findOwnedSlot(User user, Long id) {
        WorkerAvailability slot = availabilityRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("가용시간 슬롯을 찾을 수 없습니다."));
        if (!slot.getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("본인의 가용시간만 수정/삭제할 수 있습니다.");
        }
        return slot;
    }
}
