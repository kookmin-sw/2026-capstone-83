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
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.access.AccessDeniedException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class WorkerAvailabilityServiceTest {

    @Mock
    private WorkerAvailabilityRepository availabilityRepository;

    @Mock
    private ApplicationEventPublisher eventPublisher;

    @InjectMocks
    private WorkerAvailabilityService availabilityService;

    // ─── 공통 픽스처 ──────────────────────────────────────────────

    private User applicant;
    private User otherApplicant;

    // 미래 날짜 (2030년 — 과거 시점 검증 통과)
    private static final LocalDate FUTURE_DATE      = LocalDate.of(2030, 6, 1);
    private static final LocalDate FUTURE_DATE_NEXT = LocalDate.of(2030, 6, 2);

    @BeforeEach
    void setUp() {
        applicant = User.builder()
                .id(1L).name("구직자").email("a@test.com").phone("01011111111")
                .role(UserRole.APPLICANT).build();

        otherApplicant = User.builder()
                .id(99L).name("타인").email("o@test.com").phone("01099999999")
                .role(UserRole.APPLICANT).build();
    }

    // ─── 생성 — 정상 ─────────────────────────────────────────────

    @Test
    @DisplayName("같은 날 단일 슬롯 생성 → 레코드 1개 저장, crossesMidnight=false, id 반환")
    void create_sameDay_savesOneRecord() {
        LocalDateTime start = LocalDateTime.of(FUTURE_DATE, LocalTime.of(9, 0));
        LocalDateTime end   = LocalDateTime.of(FUTURE_DATE, LocalTime.of(18, 0));

        givenNoOverlap();
        WorkerAvailability saved = savedSlot(5L, applicant, start, end);
        when(availabilityRepository.save(any(WorkerAvailability.class))).thenReturn(saved);

        WorkerAvailabilityResponse response =
                availabilityService.create(applicant, new WorkerAvailabilityCreateRequest(start, end, null));

        verify(availabilityRepository).save(any(WorkerAvailability.class));
        assertThat(response.id()).isEqualTo(5L);
        assertThat(response.crossesMidnight()).isFalse();
        assertThat(response.startAt()).isEqualTo(start);
        assertThat(response.endAt()).isEqualTo(end);
    }

    @Test
    @DisplayName("야간 슬롯 생성 (22:00–익일 06:00) → 레코드 1개, crossesMidnight=true, 시간 정확")
    void create_overnight_savesOneRecord_crossesMidnight() {
        LocalDateTime start = LocalDateTime.of(FUTURE_DATE, LocalTime.of(22, 0));
        LocalDateTime end   = LocalDateTime.of(FUTURE_DATE_NEXT, LocalTime.of(6, 0));

        givenNoOverlap();
        WorkerAvailability saved = savedSlot(6L, applicant, start, end);
        when(availabilityRepository.save(any(WorkerAvailability.class))).thenReturn(saved);

        WorkerAvailabilityResponse response =
                availabilityService.create(applicant, new WorkerAvailabilityCreateRequest(start, end, null));

        // 단일 레코드 저장
        verify(availabilityRepository).save(any(WorkerAvailability.class));
        assertThat(response.id()).isEqualTo(6L);
        assertThat(response.crossesMidnight()).isTrue();
        assertThat(response.startAt()).isEqualTo(start);
        assertThat(response.endAt()).isEqualTo(end);
    }

    // ─── 생성 — 예외 ─────────────────────────────────────────────

    @Test
    @DisplayName("과거 시점 생성 → IllegalStateException")
    void create_pastStartAt_throws() {
        LocalDateTime pastStart = LocalDateTime.of(2020, 1, 1, 9, 0);
        LocalDateTime pastEnd   = LocalDateTime.of(2020, 1, 1, 18, 0);

        assertThatThrownBy(() ->
                availabilityService.create(applicant,
                        new WorkerAvailabilityCreateRequest(pastStart, pastEnd, null)))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("과거");

        verify(availabilityRepository, never()).save(any());
    }

    @Test
    @DisplayName("24시간 초과 슬롯 생성 → IllegalStateException")
    void create_over24Hours_throws() {
        LocalDateTime start = LocalDateTime.of(FUTURE_DATE, LocalTime.of(9, 0));
        LocalDateTime end   = start.plusHours(25);

        assertThatThrownBy(() ->
                availabilityService.create(applicant,
                        new WorkerAvailabilityCreateRequest(start, end, null)))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("24시간");

        verify(availabilityRepository, never()).save(any());
    }

    @Test
    @DisplayName("겹치는 슬롯 생성 → DuplicateException")
    void create_overlapping_throws() {
        LocalDateTime start = LocalDateTime.of(FUTURE_DATE, LocalTime.of(9, 0));
        LocalDateTime end   = LocalDateTime.of(FUTURE_DATE, LocalTime.of(18, 0));

        WorkerAvailability existing = savedSlot(3L, applicant, start, end);
        when(availabilityRepository.findOverlapping(
                eq(applicant.getId()), eq(start), eq(end), isNull()))
                .thenReturn(List.of(existing));

        assertThatThrownBy(() ->
                availabilityService.create(applicant,
                        new WorkerAvailabilityCreateRequest(start, end, null)))
                .isInstanceOf(DuplicateException.class)
                .hasMessageContaining("이미 가용시간");

        verify(availabilityRepository, never()).save(any());
    }

    @Test
    @DisplayName("딱 붙은 슬롯 (기존 09:00–18:00, 신규 18:00–22:00) → 겹침 없음, 정상 생성 (열린 부등호)")
    void create_adjacentSlot_noOverlap() {
        LocalDateTime start = LocalDateTime.of(FUTURE_DATE, LocalTime.of(18, 0));
        LocalDateTime end   = LocalDateTime.of(FUTURE_DATE, LocalTime.of(22, 0));

        when(availabilityRepository.findOverlapping(
                eq(applicant.getId()), eq(start), eq(end), isNull()))
                .thenReturn(List.of()); // 열린 부등호라 경계에서 겹치지 않음
        WorkerAvailability saved = savedSlot(7L, applicant, start, end);
        when(availabilityRepository.save(any(WorkerAvailability.class))).thenReturn(saved);

        WorkerAvailabilityResponse response =
                availabilityService.create(applicant,
                        new WorkerAvailabilityCreateRequest(start, end, null));

        verify(availabilityRepository).save(any());
        assertThat(response.crossesMidnight()).isFalse();
    }

    // ─── 수정 — 정상 ─────────────────────────────────────────────

    @Test
    @DisplayName("update → ID 보존 확인 (delete+insert 아님)")
    void update_preservesId() {
        LocalDateTime oldStart = LocalDateTime.of(FUTURE_DATE, LocalTime.of(9, 0));
        LocalDateTime oldEnd   = LocalDateTime.of(FUTURE_DATE, LocalTime.of(18, 0));
        WorkerAvailability existing = savedSlot(5L, applicant, oldStart, oldEnd);

        LocalDateTime newStart = LocalDateTime.of(FUTURE_DATE, LocalTime.of(10, 0));
        LocalDateTime newEnd   = LocalDateTime.of(FUTURE_DATE, LocalTime.of(19, 0));

        when(availabilityRepository.findById(5L)).thenReturn(Optional.of(existing));
        when(availabilityRepository.findOverlapping(
                eq(applicant.getId()), eq(newStart), eq(newEnd), eq(5L)))
                .thenReturn(List.of());

        WorkerAvailability updated = savedSlot(5L, applicant, newStart, newEnd);
        when(availabilityRepository.save(any(WorkerAvailability.class))).thenReturn(updated);

        WorkerAvailabilityResponse response = availabilityService.update(
                applicant, 5L, new WorkerAvailabilityUpdateRequest(newStart, newEnd, null));

        // delete 호출 없음 — 단순 save
        verify(availabilityRepository, never()).delete(any());
        verify(availabilityRepository, never()).deleteAll(any());

        // 저장 인수의 id 가 기존 id(5L)로 보존됐는지 확인
        ArgumentCaptor<WorkerAvailability> captor = ArgumentCaptor.forClass(WorkerAvailability.class);
        verify(availabilityRepository).save(captor.capture());
        assertThat(captor.getValue().getId()).isEqualTo(5L);

        assertThat(response.startAt()).isEqualTo(newStart);
        assertThat(response.endAt()).isEqualTo(newEnd);
    }

    @Test
    @DisplayName("update 시 자기 자신 겹침 제외 → 정상 수정 (excludeId = 기존 id)")
    void update_selfOverlap_excludedSuccessfully() {
        LocalDateTime oldStart = LocalDateTime.of(FUTURE_DATE, LocalTime.of(9, 0));
        LocalDateTime oldEnd   = LocalDateTime.of(FUTURE_DATE, LocalTime.of(18, 0));
        WorkerAvailability existing = savedSlot(5L, applicant, oldStart, oldEnd);

        // 새 시간이 기존 시간과 겹치지만 자기 자신(id=5)이라 허용
        LocalDateTime newStart = LocalDateTime.of(FUTURE_DATE, LocalTime.of(10, 0));
        LocalDateTime newEnd   = LocalDateTime.of(FUTURE_DATE, LocalTime.of(17, 0));

        when(availabilityRepository.findById(5L)).thenReturn(Optional.of(existing));
        // excludeId = 5L 로 자기 자신 제외 → 겹침 없음
        when(availabilityRepository.findOverlapping(
                eq(applicant.getId()), eq(newStart), eq(newEnd), eq(5L)))
                .thenReturn(List.of());
        WorkerAvailability updated = savedSlot(5L, applicant, newStart, newEnd);
        when(availabilityRepository.save(any(WorkerAvailability.class))).thenReturn(updated);

        assertThatNoException().isThrownBy(() ->
                availabilityService.update(applicant, 5L,
                        new WorkerAvailabilityUpdateRequest(newStart, newEnd, null)));
    }

    // ─── 수정 — 예외 ─────────────────────────────────────────────

    @Test
    @DisplayName("다른 사람 슬롯 update → AccessDeniedException")
    void update_notOwner_throws() {
        LocalDateTime start = LocalDateTime.of(FUTURE_DATE, LocalTime.of(9, 0));
        LocalDateTime end   = LocalDateTime.of(FUTURE_DATE, LocalTime.of(18, 0));
        WorkerAvailability othersSlot = savedSlot(10L, otherApplicant, start, end);

        when(availabilityRepository.findById(10L)).thenReturn(Optional.of(othersSlot));

        LocalDateTime newStart = LocalDateTime.of(FUTURE_DATE, LocalTime.of(10, 0));
        LocalDateTime newEnd   = LocalDateTime.of(FUTURE_DATE, LocalTime.of(19, 0));

        assertThatThrownBy(() ->
                availabilityService.update(applicant, 10L,
                        new WorkerAvailabilityUpdateRequest(newStart, newEnd, null)))
                .isInstanceOf(AccessDeniedException.class);

        verify(availabilityRepository, never()).save(any());
    }

    @Test
    @DisplayName("존재하지 않는 슬롯 update → NotFoundException")
    void update_notFound_throws() {
        when(availabilityRepository.findById(999L)).thenReturn(Optional.empty());

        LocalDateTime start = LocalDateTime.of(FUTURE_DATE, LocalTime.of(10, 0));
        LocalDateTime end   = LocalDateTime.of(FUTURE_DATE, LocalTime.of(19, 0));

        assertThatThrownBy(() ->
                availabilityService.update(applicant, 999L,
                        new WorkerAvailabilityUpdateRequest(start, end, null)))
                .isInstanceOf(NotFoundException.class);
    }

    // ─── 삭제 ────────────────────────────────────────────────────

    @Test
    @DisplayName("delete → 단건 삭제 (deleteAll 아님)")
    void delete_singleRecord_deletedOnce() {
        LocalDateTime start = LocalDateTime.of(FUTURE_DATE, LocalTime.of(9, 0));
        LocalDateTime end   = LocalDateTime.of(FUTURE_DATE, LocalTime.of(18, 0));
        WorkerAvailability slot = savedSlot(1L, applicant, start, end);

        when(availabilityRepository.findById(1L)).thenReturn(Optional.of(slot));

        availabilityService.delete(applicant, 1L);

        verify(availabilityRepository).delete(slot);
        verify(availabilityRepository, never()).deleteAll(any());
    }

    @Test
    @DisplayName("야간 슬롯 delete → 단건만 삭제")
    void delete_overnightSlot_deletedOnce() {
        LocalDateTime start = LocalDateTime.of(FUTURE_DATE, LocalTime.of(22, 0));
        LocalDateTime end   = LocalDateTime.of(FUTURE_DATE_NEXT, LocalTime.of(6, 0));
        WorkerAvailability slot = savedSlot(2L, applicant, start, end);

        when(availabilityRepository.findById(2L)).thenReturn(Optional.of(slot));

        availabilityService.delete(applicant, 2L);

        verify(availabilityRepository).delete(slot);
    }

    // ─── 범위 조회 ───────────────────────────────────────────────

    @Test
    @DisplayName("범위 조회: 야간 슬롯이 범위 경계에 걸쳐 있어도 overlap 쿼리로 반환")
    void getRange_overnightSlotAtBoundary_returned() {
        // 야간 슬롯: 2030-06-01 22:00 ~ 2030-06-02 06:00
        LocalDateTime start = LocalDateTime.of(FUTURE_DATE, LocalTime.of(22, 0));
        LocalDateTime end   = LocalDateTime.of(FUTURE_DATE_NEXT, LocalTime.of(6, 0));
        WorkerAvailability slot = savedSlot(1L, applicant, start, end);

        // 조회 범위: 2030-06-01 only → fromStart=2030-06-01T00:00, toEnd=2030-06-02T00:00
        LocalDateTime fromStart = FUTURE_DATE.atStartOfDay();
        LocalDateTime toEnd     = FUTURE_DATE.plusDays(1).atStartOfDay();

        when(availabilityRepository.findByUserIdAndRange(
                eq(applicant.getId()), eq(fromStart), eq(toEnd)))
                .thenReturn(List.of(slot));

        List<WorkerAvailabilityResponse> result =
                availabilityService.getRange(applicant, FUTURE_DATE, FUTURE_DATE);

        assertThat(result).hasSize(1);
        WorkerAvailabilityResponse resp = result.get(0);
        assertThat(resp.crossesMidnight()).isTrue();
        assertThat(resp.startAt()).isEqualTo(start);
        assertThat(resp.endAt()).isEqualTo(end);
    }

    @Test
    @DisplayName("범위 조회: 범위 내 슬롯 없음 → 빈 목록")
    void getRange_empty_returnsEmptyList() {
        when(availabilityRepository.findByUserIdAndRange(anyLong(), any(), any()))
                .thenReturn(List.of());

        List<WorkerAvailabilityResponse> result =
                availabilityService.getRange(applicant, FUTURE_DATE, FUTURE_DATE);

        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("범위 조회: 여러 슬롯 → availStartAt 오름차순 반환")
    void getRange_multipleSlots_returnedInOrder() {
        LocalDateTime start1 = LocalDateTime.of(FUTURE_DATE, LocalTime.of(9, 0));
        LocalDateTime end1   = LocalDateTime.of(FUTURE_DATE, LocalTime.of(12, 0));
        LocalDateTime start2 = LocalDateTime.of(FUTURE_DATE, LocalTime.of(14, 0));
        LocalDateTime end2   = LocalDateTime.of(FUTURE_DATE, LocalTime.of(18, 0));

        WorkerAvailability slot1 = savedSlot(1L, applicant, start1, end1);
        WorkerAvailability slot2 = savedSlot(2L, applicant, start2, end2);

        when(availabilityRepository.findByUserIdAndRange(
                eq(applicant.getId()), any(), any()))
                .thenReturn(List.of(slot1, slot2)); // 이미 ORDER BY availStartAt ASC

        List<WorkerAvailabilityResponse> result =
                availabilityService.getRange(applicant, FUTURE_DATE, FUTURE_DATE);

        assertThat(result).hasSize(2);
        assertThat(result.get(0).startAt()).isEqualTo(start1);
        assertThat(result.get(1).startAt()).isEqualTo(start2);
    }

    // ─── AvailabilityCreatedEvent 발행 검증 ──────────────────────

    @Test
    @DisplayName("create 후 AvailabilityCreatedEvent 발행 — availabilityId, availStartAt, availEndAt 포함")
    void create_publishesAvailabilityCreatedEvent() {
        LocalDateTime start = LocalDateTime.of(FUTURE_DATE, LocalTime.of(9, 0));
        LocalDateTime end   = LocalDateTime.of(FUTURE_DATE, LocalTime.of(18, 0));

        givenNoOverlap();
        WorkerAvailability saved = savedSlot(5L, applicant, start, end);
        when(availabilityRepository.save(any(WorkerAvailability.class))).thenReturn(saved);

        availabilityService.create(applicant, new WorkerAvailabilityCreateRequest(start, end, 0));

        ArgumentCaptor<AutoMatchEvents.AvailabilityCreatedEvent> captor =
                ArgumentCaptor.forClass(AutoMatchEvents.AvailabilityCreatedEvent.class);
        verify(eventPublisher).publishEvent(captor.capture());

        AutoMatchEvents.AvailabilityCreatedEvent event = captor.getValue();
        assertThat(event.userId()).isEqualTo(applicant.getId());
        assertThat(event.availabilityId()).isEqualTo(5L);
        assertThat(event.availStartAt()).isEqualTo(start);
        assertThat(event.availEndAt()).isEqualTo(end);
    }

    // ─── helpers ─────────────────────────────────────────────────

    /** findOverlapping 이 빈 목록 반환(겹침 없음)하도록 lenient 스텁. */
    private void givenNoOverlap() {
        lenient().when(availabilityRepository.findOverlapping(
                anyLong(), any(), any(), any()))
                .thenReturn(List.of());
    }

    /**
     * 저장된 것처럼 id/createdAt/updatedAt 이 채워진 WorkerAvailability 빌더 헬퍼.
     * {@code @PrePersist} 는 실제 저장 시 동작하므로 여기서는 직접 값 주입.
     */
    private static WorkerAvailability savedSlot(
            Long id, User owner, LocalDateTime start, LocalDateTime end) {
        return WorkerAvailability.builder()
                .id(id)
                .user(owner)
                .availStartAt(start)
                .availEndAt(end)
                .minDurationMinutes(0)
                .createdAt(LocalDateTime.of(2030, 1, 1, 0, 0))
                .updatedAt(LocalDateTime.of(2030, 1, 1, 0, 0))
                .build();
    }
}
