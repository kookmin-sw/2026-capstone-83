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

        // saveAll → 인수 그대로 반환 (ID 없음, 테스트 목적상 충분)
        lenient().when(availabilityRepository.saveAll(anyList()))
                .thenAnswer(inv -> inv.getArgument(0));
    }

    // ─── 생성 — 정상 ─────────────────────────────────────────────

    @Test
    @DisplayName("같은 날 단일 슬롯 생성 → 레코드 1개 저장, crossesMidnight=false")
    void create_sameDay_savesOneRecord() {
        LocalDateTime start = LocalDateTime.of(FUTURE_DATE, LocalTime.of(9, 0));
        LocalDateTime end   = LocalDateTime.of(FUTURE_DATE, LocalTime.of(18, 0));

        givenNoOverlap();

        WorkerAvailabilityResponse response =
                availabilityService.create(applicant, new WorkerAvailabilityCreateRequest(start, end, null));

        ArgumentCaptor<List<WorkerAvailability>> captor = listCaptor();
        verify(availabilityRepository).saveAll(captor.capture());

        assertThat(captor.getValue()).hasSize(1);
        assertThat(response.crossesMidnight()).isFalse();
        assertThat(response.startAt()).isEqualTo(start);
        assertThat(response.endAt()).isEqualTo(end);
        assertThat(response.linkedGroupId()).isNotNull().hasSize(36);
    }

    @Test
    @DisplayName("자정 넘김 슬롯 생성 (22:00–익일 06:00) → 레코드 2개 저장, crossesMidnight=true")
    void create_overnight_savesTwoRecords() {
        LocalDateTime start = LocalDateTime.of(FUTURE_DATE, LocalTime.of(22, 0));
        LocalDateTime end   = LocalDateTime.of(FUTURE_DATE_NEXT, LocalTime.of(6, 0));

        givenNoOverlap();

        WorkerAvailabilityResponse response =
                availabilityService.create(applicant, new WorkerAvailabilityCreateRequest(start, end, null));

        ArgumentCaptor<List<WorkerAvailability>> captor = listCaptor();
        verify(availabilityRepository).saveAll(captor.capture());

        List<WorkerAvailability> saved = captor.getValue();
        assertThat(saved).hasSize(2);
        assertThat(response.crossesMidnight()).isTrue();
        assertThat(response.startAt()).isEqualTo(start);
        assertThat(response.endAt()).isEqualTo(end);

        // 두 레코드가 동일한 linkedGroupId 공유
        String groupId = saved.get(0).getLinkedGroupId();
        assertThat(saved.get(1).getLinkedGroupId()).isEqualTo(groupId);

        // Day1 endTime = LocalTime.MAX, Day2 startTime = LocalTime.MIN
        assertThat(saved.get(0).getEndTime()).isEqualTo(LocalTime.MAX);
        assertThat(saved.get(1).getStartTime()).isEqualTo(LocalTime.MIN);
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

        verify(availabilityRepository, never()).saveAll(any());
    }

    @Test
    @DisplayName("겹치는 슬롯 생성 → DuplicateException")
    void create_overlapping_throws() {
        LocalDateTime start = LocalDateTime.of(FUTURE_DATE, LocalTime.of(9, 0));
        LocalDateTime end   = LocalDateTime.of(FUTURE_DATE, LocalTime.of(18, 0));

        // 겹치는 그룹이 이미 존재
        when(availabilityRepository.findOverlappingGroupIds(
                eq(applicant.getId()), eq(start), eq(end), isNull()))
                .thenReturn(List.of("existing-group-id"));

        assertThatThrownBy(() ->
                availabilityService.create(applicant,
                        new WorkerAvailabilityCreateRequest(start, end, null)))
                .isInstanceOf(DuplicateException.class)
                .hasMessageContaining("이미 가용시간");

        verify(availabilityRepository, never()).saveAll(any());
    }

    @Test
    @DisplayName("딱 붙은 슬롯 (기존 09:00–18:00, 신규 18:00–22:00) → 겹침 없음, 정상 생성 (열린 부등호)")
    void create_adjacentSlot_noOverlap() {
        LocalDateTime start = LocalDateTime.of(FUTURE_DATE, LocalTime.of(18, 0));
        LocalDateTime end   = LocalDateTime.of(FUTURE_DATE, LocalTime.of(22, 0));

        // 겹침 쿼리 — 열린 부등호(groupEndAt > newStart AND groupStartAt < newEnd)이므로
        // 기존 09:00–18:00 과 신규 18:00–22:00 는 경계점에서 겹치지 않는다 → 빈 목록
        when(availabilityRepository.findOverlappingGroupIds(
                eq(applicant.getId()), eq(start), eq(end), isNull()))
                .thenReturn(List.of());

        WorkerAvailabilityResponse response =
                availabilityService.create(applicant,
                        new WorkerAvailabilityCreateRequest(start, end, null));

        verify(availabilityRepository).saveAll(any());
        assertThat(response.crossesMidnight()).isFalse();
    }

    // ─── 수정 — 정상 ─────────────────────────────────────────────

    @Test
    @DisplayName("자기 자신 그룹과 시간 겹치는 update → excludeGroupId 로 제외, 정상 수정")
    void update_selfOverlap_succeeds() {
        String groupId = "my-group-uuid";
        WorkerAvailability existing = singleRecord(5L, applicant, FUTURE_DATE, 9, 18, groupId);

        // 신규 시간: 10:00–19:00 (기존과 겹치지만 자기 자신이라 허용)
        LocalDateTime newStart = LocalDateTime.of(FUTURE_DATE, LocalTime.of(10, 0));
        LocalDateTime newEnd   = LocalDateTime.of(FUTURE_DATE, LocalTime.of(19, 0));

        when(availabilityRepository.findById(5L)).thenReturn(Optional.of(existing));
        // 자기 자신 그룹 제외 후 겹침 없음
        when(availabilityRepository.findOverlappingGroupIds(
                eq(applicant.getId()), eq(newStart), eq(newEnd), eq(groupId)))
                .thenReturn(List.of());
        when(availabilityRepository.findByLinkedGroupId(groupId))
                .thenReturn(List.of(existing));

        WorkerAvailabilityResponse response = availabilityService.update(
                applicant, 5L,
                new WorkerAvailabilityUpdateRequest(newStart, newEnd, null));

        verify(availabilityRepository).deleteAll(List.of(existing));  // 기존 삭제
        verify(availabilityRepository).saveAll(any());                // 새 그룹 저장
        assertThat(response.startAt()).isEqualTo(newStart);
        assertThat(response.endAt()).isEqualTo(newEnd);
    }

    // ─── 수정 — 예외 ─────────────────────────────────────────────

    @Test
    @DisplayName("다른 사람 슬롯 update → AccessDeniedException")
    void update_notOwner_throws() {
        // otherApplicant 소유의 슬롯을 applicant 가 수정 시도
        WorkerAvailability othersSlot = singleRecord(10L, otherApplicant, FUTURE_DATE, 9, 18, "other-group");

        when(availabilityRepository.findById(10L)).thenReturn(Optional.of(othersSlot));

        LocalDateTime start = LocalDateTime.of(FUTURE_DATE, LocalTime.of(10, 0));
        LocalDateTime end   = LocalDateTime.of(FUTURE_DATE, LocalTime.of(19, 0));

        assertThatThrownBy(() ->
                availabilityService.update(applicant, 10L,
                        new WorkerAvailabilityUpdateRequest(start, end, null)))
                .isInstanceOf(AccessDeniedException.class);

        verify(availabilityRepository, never()).deleteAll(any());
        verify(availabilityRepository, never()).saveAll(any());
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
    @DisplayName("자정 분할 슬롯 delete → 그룹 내 2개 레코드 모두 삭제")
    void delete_splitGroup_deletesBothRecords() {
        String groupId = "split-group";

        WorkerAvailability day1 = WorkerAvailability.builder()
                .id(1L).user(applicant)
                .date(FUTURE_DATE).startTime(LocalTime.of(22, 0)).endTime(LocalTime.MAX)
                .linkedGroupId(groupId)
                .groupStartAt(LocalDateTime.of(FUTURE_DATE, LocalTime.of(22, 0)))
                .groupEndAt(LocalDateTime.of(FUTURE_DATE_NEXT, LocalTime.of(6, 0)))
                .build();
        WorkerAvailability day2 = WorkerAvailability.builder()
                .id(2L).user(applicant)
                .date(FUTURE_DATE_NEXT).startTime(LocalTime.MIN).endTime(LocalTime.of(6, 0))
                .linkedGroupId(groupId)
                .groupStartAt(LocalDateTime.of(FUTURE_DATE, LocalTime.of(22, 0)))
                .groupEndAt(LocalDateTime.of(FUTURE_DATE_NEXT, LocalTime.of(6, 0)))
                .build();

        when(availabilityRepository.findById(1L)).thenReturn(Optional.of(day1));
        when(availabilityRepository.findByLinkedGroupId(groupId)).thenReturn(List.of(day1, day2));

        availabilityService.delete(applicant, 1L);

        // deleteAll 에 2개 레코드가 전달됐는지 확인
        ArgumentCaptor<List<WorkerAvailability>> captor = listCaptor();
        verify(availabilityRepository).deleteAll(captor.capture());
        assertThat(captor.getValue()).hasSize(2)
                .extracting(WorkerAvailability::getId)
                .containsExactlyInAnyOrder(1L, 2L);
    }

    // ─── 범위 조회 ───────────────────────────────────────────────

    @Test
    @DisplayName("범위 조회: Day1 만 범위 안에 있고 Day2 가 범위 밖 → 그룹 전체 반환 (crossesMidnight=true)")
    void getRange_day1InRangeDay2Outside_returnsFullGroup() {
        String groupId = "overnight-group";

        // Day1 = 2030-06-01 (범위 안), Day2 = 2030-06-02 (범위 밖)
        WorkerAvailability day1 = WorkerAvailability.builder()
                .id(1L).user(applicant)
                .date(FUTURE_DATE).startTime(LocalTime.of(22, 0)).endTime(LocalTime.MAX)
                .linkedGroupId(groupId)
                .groupStartAt(LocalDateTime.of(FUTURE_DATE, LocalTime.of(22, 0)))
                .groupEndAt(LocalDateTime.of(FUTURE_DATE_NEXT, LocalTime.of(6, 0)))
                .build();
        WorkerAvailability day2 = WorkerAvailability.builder()
                .id(2L).user(applicant)
                .date(FUTURE_DATE_NEXT).startTime(LocalTime.MIN).endTime(LocalTime.of(6, 0))
                .linkedGroupId(groupId)
                .groupStartAt(LocalDateTime.of(FUTURE_DATE, LocalTime.of(22, 0)))
                .groupEndAt(LocalDateTime.of(FUTURE_DATE_NEXT, LocalTime.of(6, 0)))
                .build();

        // 쿼리 범위: 2030-06-01 only → Day1 만 반환
        when(availabilityRepository.findByUserIdAndDateBetweenOrderByDateAscStartTimeAsc(
                eq(applicant.getId()), eq(FUTURE_DATE), eq(FUTURE_DATE)))
                .thenReturn(List.of(day1));

        // IN 쿼리로 그룹 전체 조회 → Day1+Day2 (Pre-correction 0-2)
        when(availabilityRepository.findByLinkedGroupIdInOrderByDateAscStartTimeAsc(List.of(groupId)))
                .thenReturn(List.of(day1, day2));

        List<WorkerAvailabilityResponse> result =
                availabilityService.getRange(applicant, FUTURE_DATE, FUTURE_DATE);

        assertThat(result).hasSize(1);
        WorkerAvailabilityResponse resp = result.get(0);
        assertThat(resp.linkedGroupId()).isEqualTo(groupId);
        assertThat(resp.crossesMidnight()).isTrue();
        assertThat(resp.startAt()).isEqualTo(LocalDateTime.of(FUTURE_DATE, LocalTime.of(22, 0)));
        assertThat(resp.endAt()).isEqualTo(LocalDateTime.of(FUTURE_DATE_NEXT, LocalTime.of(6, 0)));
    }

    @Test
    @DisplayName("범위 조회: 범위 내 슬롯 없음 → 빈 목록")
    void getRange_empty_returnsEmptyList() {
        when(availabilityRepository.findByUserIdAndDateBetweenOrderByDateAscStartTimeAsc(
                anyLong(), any(), any()))
                .thenReturn(List.of());

        List<WorkerAvailabilityResponse> result =
                availabilityService.getRange(applicant, FUTURE_DATE, FUTURE_DATE);

        assertThat(result).isEmpty();
    }

    // ─── Pre-correction 0-1: linkedGroupId 보존 검증 ──────────────

    @Test
    @DisplayName("update 후 linkedGroupId 는 기존 값과 동일해야 한다 (Pre-correction 0-1)")
    void update_preservesLinkedGroupId() {
        String originalGroupId = "original-group-uuid";
        WorkerAvailability existing = singleRecord(7L, applicant, FUTURE_DATE, 9, 18, originalGroupId);

        LocalDateTime newStart = LocalDateTime.of(FUTURE_DATE, LocalTime.of(8, 0));
        LocalDateTime newEnd   = LocalDateTime.of(FUTURE_DATE, LocalTime.of(17, 0));

        when(availabilityRepository.findById(7L)).thenReturn(Optional.of(existing));
        when(availabilityRepository.findOverlappingGroupIds(
                eq(applicant.getId()), eq(newStart), eq(newEnd), eq(originalGroupId)))
                .thenReturn(List.of());
        when(availabilityRepository.findByLinkedGroupId(originalGroupId))
                .thenReturn(List.of(existing));
        // saveAll → 인수 그대로 반환 (setUp 에서 lenient 스텁 설정됨)

        WorkerAvailabilityResponse response = availabilityService.update(
                applicant, 7L, new WorkerAvailabilityUpdateRequest(newStart, newEnd, null));

        // linkedGroupId 는 originalGroupId 와 동일해야 한다
        assertThat(response.linkedGroupId()).isEqualTo(originalGroupId);

        // 저장된 레코드의 linkedGroupId 도 검증
        ArgumentCaptor<List<WorkerAvailability>> captor = listCaptor();
        verify(availabilityRepository).saveAll(captor.capture());
        assertThat(captor.getValue()).allSatisfy(wa ->
                assertThat(wa.getLinkedGroupId()).isEqualTo(originalGroupId));
    }

    // ─── helpers ─────────────────────────────────────────────────

    /** findOverlappingGroupIds 가 빈 목록 반환(겹침 없음)하도록 스텁. */
    private void givenNoOverlap() {
        lenient().when(availabilityRepository.findOverlappingGroupIds(
                anyLong(), any(), any(), any()))
                .thenReturn(List.of());
    }

    /** 단일 레코드(분할 없는 슬롯) 빌더 헬퍼. */
    private static WorkerAvailability singleRecord(
            Long id, User owner, LocalDate date, int startHour, int endHour, String groupId) {
        LocalDateTime groupStart = LocalDateTime.of(date, LocalTime.of(startHour, 0));
        LocalDateTime groupEnd   = LocalDateTime.of(date, LocalTime.of(endHour, 0));
        return WorkerAvailability.builder()
                .id(id).user(owner)
                .date(date)
                .startTime(LocalTime.of(startHour, 0))
                .endTime(LocalTime.of(endHour, 0))
                .linkedGroupId(groupId)
                .groupStartAt(groupStart)
                .groupEndAt(groupEnd)
                .build();
    }

    /** List<WorkerAvailability> ArgumentCaptor 생성 헬퍼 (타입 캐스팅 경고 억제). */
    @SuppressWarnings("unchecked")
    private static ArgumentCaptor<List<WorkerAvailability>> listCaptor() {
        return ArgumentCaptor.forClass(List.class);
    }
}
