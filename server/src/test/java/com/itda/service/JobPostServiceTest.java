package com.itda.service;

import com.itda.dto.request.JobPostCreateRequest;
import com.itda.dto.response.JobPostDetailResponse;
import com.itda.entity.Employer;
import com.itda.entity.JobPost;
import com.itda.entity.User;
import com.itda.entity.Workplace;
import com.itda.enums.UserRole;
import com.itda.enums.WageType;
import com.itda.repository.ApplicationRepository;
import com.itda.repository.JobPostLikeRepository;
import com.itda.repository.JobPostRepository;
import com.itda.repository.LongTermWorkerRepository;
import com.itda.repository.UserRepository;
import com.itda.repository.WorkplaceRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * JobPostService 단위 테스트.
 *
 * <p>V3 이후 JobPost 는 항상 단일 레코드로 저장된다.
 * 자정 넘김 공고도 1개 레코드에 {@code workStartAt}/{@code workEndAt} 으로 범위를 표현한다.
 */
@ExtendWith(MockitoExtension.class)
class JobPostServiceTest {

    @Mock private JobPostRepository       jobPostRepository;
    @Mock private ApplicationRepository   applicationRepository;
    @Mock private JobPostLikeRepository   jobPostLikeRepository;
    @Mock private LikeService             likeService;
    @Mock private S3Service               s3Service;
    @Mock private NotificationService     notificationService;
    @Mock private WorkplaceRepository     workplaceRepository;
    @Mock private JobPostRankingService   rankingService;
    @Mock private ApplicationEventPublisher eventPublisher;
    @Mock private LongTermWorkerRepository longTermWorkerRepository;
    @Mock private UserRepository          userRepository;
    @Mock private ApplicationService      applicationService;

    @InjectMocks
    private JobPostService jobPostService;

    /** 테스트용 Workplace (JobPostDetailResponse.from() 내부에서 getCompanyName() 등 호출됨) */
    private Workplace mockWorkplace;

    @BeforeEach
    void setUp() {
        User user = User.builder()
                .id(1L).name("테스트고용주").email("emp@test.com").phone("010-0000-0000")
                .role(UserRole.EMPLOYER).build();
        Employer employer = Employer.builder().id(1L).user(user).build();
        mockWorkplace = Workplace.builder()
                .id(1L).employer(employer)
                .name("테스트사업장").companyName("테스트(주)").address("서울시 강남구")
                .businessNumber("123-45-67890").build();

        // save() 는 인수를 그대로 반환
        lenient().when(jobPostRepository.save(any(JobPost.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
    }

    // ─── 등록 — 단일 레코드 저장 검증 ──────────────────────────────

    @Test
    @DisplayName("같은 날 공고 (09:00–18:00) → JobPost 1개 저장, workStartAt/workEndAt 당일로 세팅")
    void createJobPost_sameDay_savesOnePost() {
        JobPostCreateRequest req = buildRequest("2026-06-01", "09:00", "18:00");

        jobPostService.createJobPost(req, mockWorkplace, null, null);

        ArgumentCaptor<JobPost> captor = ArgumentCaptor.forClass(JobPost.class);
        verify(jobPostRepository, times(1)).save(captor.capture());

        JobPost saved = captor.getValue();
        assertThat(saved.getWorkDate()).isEqualTo(LocalDate.of(2026, 6, 1));
        assertThat(saved.getWorkStart()).isEqualTo(LocalTime.of(9, 0));
        assertThat(saved.getWorkEnd()).isEqualTo(LocalTime.of(18, 0));

        // 매칭용 datetime — 당일 범위
        assertThat(saved.getWorkStartAt())
                .isEqualTo(LocalDateTime.of(2026, 6, 1, 9, 0));
        assertThat(saved.getWorkEndAt())
                .isEqualTo(LocalDateTime.of(2026, 6, 1, 18, 0));
        assertThat(saved.getWorkEndAt()).isAfter(saved.getWorkStartAt());
    }

    @Test
    @DisplayName("자정 넘김 공고 (22:00–익일 06:00) → JobPost 1개 저장, workEndAt 이 다음날")
    void createJobPost_overnight_savesOnePost() {
        JobPostCreateRequest req = buildRequest("2026-06-01", "22:00", "06:00");

        jobPostService.createJobPost(req, mockWorkplace, null, null);

        // save() 는 1번만 호출돼야 함 (분할 없음)
        ArgumentCaptor<JobPost> captor = ArgumentCaptor.forClass(JobPost.class);
        verify(jobPostRepository, times(1)).save(captor.capture());

        JobPost saved = captor.getValue();

        // 표시용 필드 — 원래 입력값 그대로
        assertThat(saved.getWorkDate()).isEqualTo(LocalDate.of(2026, 6, 1));
        assertThat(saved.getWorkStart()).isEqualTo(LocalTime.of(22, 0));
        assertThat(saved.getWorkEnd()).isEqualTo(LocalTime.of(6, 0));   // MAX sentinel 없음

        // 매칭용 datetime — workEndAt 이 익일
        assertThat(saved.getWorkStartAt())
                .isEqualTo(LocalDateTime.of(2026, 6, 1, 22, 0));
        assertThat(saved.getWorkEndAt())
                .isEqualTo(LocalDateTime.of(2026, 6, 2, 6, 0));
        assertThat(saved.getWorkEndAt()).isAfter(saved.getWorkStartAt());
    }

    @Test
    @DisplayName("자정 정각 종료 공고 (22:00–00:00) → 1개 저장, workEnd=00:00, workEndAt=익일 00:00")
    void createJobPost_midnightExact_savesOnePost() {
        // workEnd=00:00 은 workStart(22:00) 보다 작으므로 자정 넘김 처리
        JobPostCreateRequest req = buildRequest("2026-06-01", "22:00", "00:00");

        jobPostService.createJobPost(req, mockWorkplace, null, null);

        ArgumentCaptor<JobPost> captor = ArgumentCaptor.forClass(JobPost.class);
        verify(jobPostRepository, times(1)).save(captor.capture());

        JobPost saved = captor.getValue();

        // workEnd 는 00:00 그대로 (LocalTime.MAX sentinel 없음)
        assertThat(saved.getWorkEnd()).isEqualTo(LocalTime.of(0, 0));

        // workEndAt = 익일 자정
        assertThat(saved.getWorkEndAt())
                .isEqualTo(LocalDate.of(2026, 6, 2).atStartOfDay());
        assertThat(saved.getWorkEndAt()).isAfter(saved.getWorkStartAt());
    }

    @Test
    @DisplayName("자정 시작 공고 (00:00–06:00) → 1개 저장, 분할 없음")
    void createJobPost_startsAtMidnight_savesOnePost() {
        JobPostCreateRequest req = buildRequest("2026-06-01", "00:00", "06:00");

        jobPostService.createJobPost(req, mockWorkplace, null, null);

        verify(jobPostRepository, times(1)).save(any(JobPost.class));
    }

    // ─── 등록 응답 검증 ──────────────────────────────────────────

    @Test
    @DisplayName("자정 넘김 공고 응답 — workDate·workStart·workEnd 는 원래 입력값 그대로")
    void createJobPost_overnight_responseShowsOriginalFields() {
        JobPostCreateRequest req = buildRequest("2026-06-01", "22:00", "06:00");

        JobPostDetailResponse response = jobPostService.createJobPost(req, mockWorkplace, null, null);

        assertThat(response.workDate()).isEqualTo("2026-06-01");
        assertThat(response.workStart()).isEqualTo("22:00");
        assertThat(response.workEnd()).isEqualTo("06:00");
    }

    @Test
    @DisplayName("자정 정각 종료 응답 — workEnd=00:00 (LocalTime.MAX 아님)")
    void createJobPost_midnightExact_responseShowsZeroEnd() {
        JobPostCreateRequest req = buildRequest("2026-06-01", "22:00", "00:00");

        JobPostDetailResponse response = jobPostService.createJobPost(req, mockWorkplace, null, null);

        assertThat(response.workEnd()).isEqualTo("00:00");
    }

    // ─── 헬퍼 ────────────────────────────────────────────────────

    /** 최소 필드로 채운 JobPostCreateRequest 생성 헬퍼. */
    private static JobPostCreateRequest buildRequest(
            String workDate, String workStart, String workEnd) {
        JobPostCreateRequest req = new JobPostCreateRequest();
        req.setTitle("테스트 공고");
        req.setJobCategory("물류·운송");
        req.setWage(10000);
        req.setWageType(WageType.HOURLY.name());
        req.setWorkDate(workDate);
        req.setWorkStart(workStart);
        req.setWorkEnd(workEnd);
        req.setTotalSlots(3);
        req.setDeadline(LocalDate.of(2026, 12, 31).toString());
        return req;
    }
}
