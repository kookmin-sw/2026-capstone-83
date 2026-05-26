package com.itda.service;

import com.itda.entity.Employer;
import com.itda.entity.JobPost;
import com.itda.entity.User;
import com.itda.entity.Workplace;
import com.itda.enums.JobPostStatus;
import com.itda.enums.UserRole;
import com.itda.enums.WageType;
import com.itda.repository.JobPostRepository;
import com.itda.repository.WorkerAvailabilityRepository;
import com.itda.service.event.AutoMatchEvents;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.Mockito.*;

/**
 * AutoMatchService 단위 테스트.
 *
 * <p>10개 시나리오:
 * <ul>
 *   <li>A1~A7: {@link AutoMatchService#matchForAvailability} 관련</li>
 *   <li>B1~B3: {@link AutoMatchService#matchForJobPost} 관련</li>
 * </ul>
 *
 * <p>V3 이후 JobPost 는 단일 레코드 구조이므로 그룹 ID 기반 로직이 제거됨.
 * Application 생성/알림 등 트랜잭션 처리는 {@link AutoMatchTransactionalSupport} 에 위임되므로
 * 이 테스트에서는 {@code txSupport.tryCreate()} 의 호출 여부·횟수만 검증한다.
 */
@ExtendWith(MockitoExtension.class)
class AutoMatchServiceTest {

    @Mock
    private JobPostRepository jobPostRepository;

    @Mock
    private WorkerAvailabilityRepository availabilityRepository;

    @Mock
    private AutoMatchTransactionalSupport txSupport;

    @InjectMocks
    private AutoMatchService autoMatchService;

    // ─── 공통 픽스처 ──────────────────────────────────────────────

    private static final Long APPLICANT_USER_ID  = 1L;
    private static final Long EMPLOYER_USER_ID   = 100L;

    // 가용시간: 2030-06-01 08:00 ~ 2030-06-01 20:00
    private static final LocalDateTime AVAIL_START =
            LocalDateTime.of(2030, 6, 1, 8, 0);
    private static final LocalDateTime AVAIL_END   =
            LocalDateTime.of(2030, 6, 1, 20, 0);

    // 공고: 2030-06-01 10:00 ~ 2030-06-01 18:00 (480분)
    private static final LocalDateTime POST_START  =
            LocalDateTime.of(2030, 6, 1, 10, 0);
    private static final LocalDateTime POST_END    =
            LocalDateTime.of(2030, 6, 1, 18, 0);
    private static final int POST_DURATION_MIN     = 480; // 8시간

    private static final Long AVAIL_ID = 42L;

    private AutoMatchEvents.AvailabilityCreatedEvent availEvent;
    private AutoMatchEvents.JobPostCreatedEvent postEvent;

    @BeforeEach
    void setUp() {
        availEvent = new AutoMatchEvents.AvailabilityCreatedEvent(
                APPLICANT_USER_ID, AVAIL_ID, AVAIL_START, AVAIL_END, 0);
        postEvent = new AutoMatchEvents.JobPostCreatedEvent(
                10L, POST_START, POST_END, EMPLOYER_USER_ID);
    }

    // ═══════════════════════════════════════════════════════════════
    // A1~A7: matchForAvailability
    // ═══════════════════════════════════════════════════════════════

    @Test
    @DisplayName("A1: 매칭 공고 없음 → txSupport 호출 없음")
    void A1_noMatchingPosts_tryCreateNotCalled() {
        when(jobPostRepository.findMatchingJobPostIdsForAvailability(
                AVAIL_START, AVAIL_END, APPLICANT_USER_ID))
                .thenReturn(List.of());

        autoMatchService.matchForAvailability(availEvent);

        verifyNoInteractions(txSupport);
    }

    @Test
    @DisplayName("A2: 1개 매칭 공고, minDuration 통과 → txSupport.tryCreate 1회 호출")
    void A2_oneMatchingPost_tryCreateCalledOnce() {
        JobPost post = buildPost(10L, POST_START, POST_END);

        when(jobPostRepository.findMatchingJobPostIdsForAvailability(
                AVAIL_START, AVAIL_END, APPLICANT_USER_ID))
                .thenReturn(List.of(10L));
        when(jobPostRepository.findAllById(List.of(10L)))
                .thenReturn(List.of(post));

        autoMatchService.matchForAvailability(availEvent); // minDuration=0 → 항상 통과

        verify(txSupport, times(1)).tryCreate(APPLICANT_USER_ID, 10L);
    }

    @Test
    @DisplayName("A3: 공고 근무 시간(480분) < minDurationMinutes(600분) → 스킵, tryCreate 없음")
    void A3_postDurationBelowMinDuration_skipped() {
        // minDuration = 600분 (10시간) > postDuration = 480분 (8시간)
        AutoMatchEvents.AvailabilityCreatedEvent strictEvent =
                new AutoMatchEvents.AvailabilityCreatedEvent(
                        APPLICANT_USER_ID, AVAIL_ID, AVAIL_START, AVAIL_END, 600);

        JobPost post = buildPost(10L, POST_START, POST_END);

        when(jobPostRepository.findMatchingJobPostIdsForAvailability(
                AVAIL_START, AVAIL_END, APPLICANT_USER_ID))
                .thenReturn(List.of(10L));
        when(jobPostRepository.findAllById(List.of(10L)))
                .thenReturn(List.of(post));

        autoMatchService.matchForAvailability(strictEvent);

        verifyNoInteractions(txSupport);
    }

    @Test
    @DisplayName("A4: findAllById 가 빈 목록 반환 → 방어 로직으로 스킵")
    void A4_allByIdEmpty_skipped() {
        when(jobPostRepository.findMatchingJobPostIdsForAvailability(
                AVAIL_START, AVAIL_END, APPLICANT_USER_ID))
                .thenReturn(List.of(10L));
        when(jobPostRepository.findAllById(List.of(10L)))
                .thenReturn(List.of()); // 방어: 빈 목록

        autoMatchService.matchForAvailability(availEvent);

        verifyNoInteractions(txSupport);
    }

    @Test
    @DisplayName("A5: txSupport.tryCreate 가 예외 던짐 → 예외 흡수, 호출자에 전파되지 않음")
    void A5_txSupportThrows_exceptionAbsorbed() {
        JobPost post = buildPost(10L, POST_START, POST_END);

        when(jobPostRepository.findMatchingJobPostIdsForAvailability(
                AVAIL_START, AVAIL_END, APPLICANT_USER_ID))
                .thenReturn(List.of(10L));
        when(jobPostRepository.findAllById(List.of(10L)))
                .thenReturn(List.of(post));
        doThrow(new RuntimeException("DB 오류"))
                .when(txSupport).tryCreate(APPLICANT_USER_ID, 10L);

        // 예외가 matchForAvailability 밖으로 전파되면 안 된다
        org.assertj.core.api.Assertions.assertThatNoException()
                .isThrownBy(() -> autoMatchService.matchForAvailability(availEvent));
    }

    @Test
    @DisplayName("A6: 2개 매칭 공고, 둘 다 통과 → tryCreate 2회 호출")
    void A6_twoMatchingPosts_tryCreateCalledTwice() {
        JobPost postA = buildPost(10L, POST_START, POST_END);
        JobPost postB = buildPost(20L, POST_START, POST_END);

        when(jobPostRepository.findMatchingJobPostIdsForAvailability(
                AVAIL_START, AVAIL_END, APPLICANT_USER_ID))
                .thenReturn(List.of(10L, 20L));
        when(jobPostRepository.findAllById(List.of(10L, 20L)))
                .thenReturn(List.of(postA, postB));

        autoMatchService.matchForAvailability(availEvent);

        verify(txSupport, times(1)).tryCreate(APPLICANT_USER_ID, 10L);
        verify(txSupport, times(1)).tryCreate(APPLICANT_USER_ID, 20L);
        verify(txSupport, times(2)).tryCreate(anyLong(), anyLong());
    }

    @Test
    @DisplayName("A7: 2개 매칭 공고, 첫 번째 tryCreate 실패 → 두 번째 tryCreate 는 여전히 호출됨 (실패 격리)")
    void A7_firstTryCreateFails_secondStillCalled() {
        JobPost postA = buildPost(10L, POST_START, POST_END);
        JobPost postB = buildPost(20L, POST_START, POST_END);

        when(jobPostRepository.findMatchingJobPostIdsForAvailability(
                AVAIL_START, AVAIL_END, APPLICANT_USER_ID))
                .thenReturn(List.of(10L, 20L));
        when(jobPostRepository.findAllById(List.of(10L, 20L)))
                .thenReturn(List.of(postA, postB));

        // 첫 번째만 실패
        doThrow(new RuntimeException("첫 번째 실패"))
                .when(txSupport).tryCreate(APPLICANT_USER_ID, 10L);

        autoMatchService.matchForAvailability(availEvent);

        // 두 번째는 정상 호출
        verify(txSupport, times(1)).tryCreate(APPLICANT_USER_ID, 20L);
    }

    // ═══════════════════════════════════════════════════════════════
    // B1~B3: matchForJobPost
    // ═══════════════════════════════════════════════════════════════

    @Test
    @DisplayName("B1: 매칭 구직자 없음 → txSupport 호출 없음")
    void B1_noMatchingApplicants_tryCreateNotCalled() {
        when(availabilityRepository.findMatchingUserIdsForJobPost(
                POST_START, POST_END, POST_DURATION_MIN, EMPLOYER_USER_ID))
                .thenReturn(List.of());

        autoMatchService.matchForJobPost(postEvent);

        verifyNoInteractions(txSupport);
    }

    @Test
    @DisplayName("B2: 1명 매칭 구직자 → tryCreate 1회 호출")
    void B2_oneMatchingApplicant_tryCreateCalledOnce() {
        when(availabilityRepository.findMatchingUserIdsForJobPost(
                POST_START, POST_END, POST_DURATION_MIN, EMPLOYER_USER_ID))
                .thenReturn(List.of(APPLICANT_USER_ID));

        autoMatchService.matchForJobPost(postEvent);

        verify(txSupport, times(1)).tryCreate(APPLICANT_USER_ID, 10L);
    }

    @Test
    @DisplayName("B3: 3명 매칭 구직자 → tryCreate 3회 호출")
    void B3_threeMatchingApplicants_tryCreateCalledThreeTimes() {
        long user1 = 1L, user2 = 2L, user3 = 3L;

        when(availabilityRepository.findMatchingUserIdsForJobPost(
                POST_START, POST_END, POST_DURATION_MIN, EMPLOYER_USER_ID))
                .thenReturn(List.of(user1, user2, user3));

        autoMatchService.matchForJobPost(postEvent);

        verify(txSupport, times(1)).tryCreate(user1, 10L);
        verify(txSupport, times(1)).tryCreate(user2, 10L);
        verify(txSupport, times(1)).tryCreate(user3, 10L);
        verify(txSupport, times(3)).tryCreate(anyLong(), eq(10L));
    }

    // ─── helpers ─────────────────────────────────────────────────

    /**
     * 테스트용 JobPost 빌더 헬퍼.
     * 고용주 User ID = {@value #EMPLOYER_USER_ID}.
     * V3 이후 linkedGroupId/groupStartAt/groupEndAt 없음; workStartAt/workEndAt 사용.
     */
    private static JobPost buildPost(Long id,
                                     LocalDateTime startAt, LocalDateTime endAt) {
        User empUser = User.builder()
                .id(EMPLOYER_USER_ID)
                .role(UserRole.EMPLOYER)
                .build();
        Employer employer = Employer.builder()
                .id(50L)
                .user(empUser)
                .build();
        Workplace workplace = Workplace.builder()
                .id(60L)
                .employer(employer)
                .name("테스트 사업장")
                .build();

        return JobPost.builder()
                .id(id)
                .workplace(workplace)
                .title("테스트 공고")
                .workDate(startAt.toLocalDate())
                .workStart(startAt.toLocalTime())
                .workEnd(endAt.toLocalTime())
                .workStartAt(startAt)
                .workEndAt(endAt)
                .wage(10000)
                .wageType(WageType.HOURLY)
                .totalSlots(2)
                .status(JobPostStatus.OPEN)
                .deadline(LocalDate.of(2030, 5, 31))
                .build();
    }
}
