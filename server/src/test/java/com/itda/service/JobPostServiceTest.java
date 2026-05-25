package com.itda.service;

import com.itda.dto.request.JobPostCreateRequest;
import com.itda.dto.response.JobPostDetailResponse;
import com.itda.entity.Employer;
import com.itda.entity.JobPost;
import com.itda.entity.User;
import com.itda.entity.Workplace;
import com.itda.enums.JobPostStatus;
import com.itda.enums.UserRole;
import com.itda.enums.WageType;
import com.itda.repository.ApplicationRepository;
import com.itda.repository.JobPostLikeRepository;
import com.itda.repository.JobPostRepository;
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
import java.time.LocalTime;
import java.util.List;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

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

    @InjectMocks
    private JobPostService jobPostService;

    /** 테스트용 Workplace (JobPostDetailResponse.from() 내부에서 getCompanyName() 등 호출됨) */
    private Workplace mockWorkplace;

    @BeforeEach
    void setUp() {
        // Workplace → Employer → User 체인 구성 (from() 호출 시 NPE 방지)
        User user = User.builder()
                .id(1L).name("테스트고용주").email("emp@test.com").phone("010-0000-0000")
                .role(UserRole.EMPLOYER).build();
        Employer employer = Employer.builder().id(1L).user(user).build();
        mockWorkplace = Workplace.builder()
                .id(1L).employer(employer)
                .name("테스트사업장").companyName("테스트(주)").address("서울시 강남구")
                .businessNumber("123-45-67890").build();

        // save() 는 인수를 그대로 반환 (ID 없이도 테스트 가능).
        // lenient: IAE 테스트에서 save() 미호출 시 UnnecessaryStubbingException 방지.
        lenient().when(jobPostRepository.save(any(JobPost.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
    }

    // ─── 등록 정상 케이스 ────────────────────────────────────────

    @Test
    @DisplayName("같은 날 공고 (09:00–18:00) → JobPost 1개 저장, linkedGroupId 부여됨")
    void createJobPost_sameDay_savesOnePost() {
        JobPostCreateRequest req = buildRequest("2026-06-01", "09:00", "18:00");

        JobPostDetailResponse response = jobPostService.createJobPost(req, mockWorkplace, null, null);

        // save() 는 1번만 호출돼야 함
        ArgumentCaptor<JobPost> captor = ArgumentCaptor.forClass(JobPost.class);
        verify(jobPostRepository, times(1)).save(captor.capture());

        JobPost saved = captor.getValue();
        assertThat(saved.getWorkDate()).isEqualTo(LocalDate.of(2026, 6, 1));
        assertThat(saved.getWorkStart()).isEqualTo(LocalTime.of(9, 0));
        assertThat(saved.getWorkEnd()).isEqualTo(LocalTime.of(18, 0));

        // 그룹 컬럼 부여 확인
        assertThat(saved.getLinkedGroupId()).isNotNull().hasSize(36);
        assertThat(saved.getGroupStartAt()).isEqualTo(saved.getWorkDate().atTime(saved.getWorkStart()));
        assertThat(saved.getGroupEndAt()).isEqualTo(saved.getWorkDate().atTime(saved.getWorkEnd()));

        // 응답 workEnd 는 groupEndAt.toLocalTime() = 18:00
        assertThat(response.workEnd()).isEqualTo("18:00");
    }

    @Test
    @DisplayName("자정 넘김 공고 (22:00–익일 06:00) → JobPost 2개 저장, 동일 linkedGroupId·groupStartAt·groupEndAt")
    void createJobPost_overnight_savesTwoPosts() {
        JobPostCreateRequest req = buildRequest("2026-06-01", "22:00", "06:00");

        jobPostService.createJobPost(req, mockWorkplace, null, null);

        // save() 는 2번 호출돼야 함
        ArgumentCaptor<JobPost> captor = ArgumentCaptor.forClass(JobPost.class);
        verify(jobPostRepository, times(2)).save(captor.capture());

        List<JobPost> saved = captor.getAllValues();
        JobPost day1 = saved.get(0);
        JobPost day2 = saved.get(1);

        // Day1 검증
        assertThat(day1.getWorkDate()).isEqualTo(LocalDate.of(2026, 6, 1));
        assertThat(day1.getWorkStart()).isEqualTo(LocalTime.of(22, 0));
        assertThat(day1.getWorkEnd()).isEqualTo(LocalTime.MAX);   // 자정 분할 sentinel

        // Day2 검증
        assertThat(day2.getWorkDate()).isEqualTo(LocalDate.of(2026, 6, 2));
        assertThat(day2.getWorkStart()).isEqualTo(LocalTime.MIN);  // 00:00
        assertThat(day2.getWorkEnd()).isEqualTo(LocalTime.of(6, 0));

        // 동일한 그룹 컬럼
        assertThat(day1.getLinkedGroupId()).isEqualTo(day2.getLinkedGroupId());
        assertThat(day1.getGroupStartAt()).isEqualTo(day2.getGroupStartAt());
        assertThat(day1.getGroupEndAt()).isEqualTo(day2.getGroupEndAt());

        // groupStartAt / groupEndAt 값 확인
        assertThat(day1.getGroupStartAt())
                .isEqualTo(LocalDate.of(2026, 6, 1).atTime(22, 0));
        assertThat(day1.getGroupEndAt())
                .isEqualTo(LocalDate.of(2026, 6, 2).atTime(6, 0));
    }

    @Test
    @DisplayName("자정 넘김 공고 응답 — workDate=시작날짜, workStart=22:00, workEnd=06:00 (LocalTime.MAX 아님)")
    void createJobPost_overnight_responseShowsOriginalWorkEnd() {
        JobPostCreateRequest req = buildRequest("2026-06-01", "22:00", "06:00");

        JobPostDetailResponse response = jobPostService.createJobPost(req, mockWorkplace, null, null);

        // 응답의 workDate/workStart/workEnd 는 사용자 원래 입력값이어야 함
        assertThat(response.workDate()).isEqualTo("2026-06-01");
        assertThat(response.workStart()).isEqualTo("22:00");
        assertThat(response.workEnd()).isEqualTo("06:00");  // groupEndAt.toLocalTime()
    }

    @Test
    @DisplayName("자정 정각 종료 공고 (22:00–익일 00:00) → JobPost 1개, workEnd=LocalTime.MAX 저장")
    void createJobPost_midnightExact_savesOnePost() {
        // workEnd = "00:00" (자정 정각) → 다음날 00:00으로 계산 → 단일 레코드, endTime=LocalTime.MAX
        JobPostCreateRequest req = buildRequest("2026-06-01", "22:00", "00:00");

        JobPostDetailResponse response = jobPostService.createJobPost(req, mockWorkplace, null, null);

        // 자정 정각 → 분할 없이 1개 저장
        ArgumentCaptor<JobPost> captor = ArgumentCaptor.forClass(JobPost.class);
        verify(jobPostRepository, times(1)).save(captor.capture());

        JobPost saved = captor.getValue();
        assertThat(saved.getWorkDate()).isEqualTo(LocalDate.of(2026, 6, 1));
        assertThat(saved.getWorkStart()).isEqualTo(LocalTime.of(22, 0));
        assertThat(saved.getWorkEnd()).isEqualTo(LocalTime.MAX);    // 자정 정각 sentinel

        // groupEndAt = 익일 00:00
        assertThat(saved.getGroupEndAt())
                .isEqualTo(LocalDate.of(2026, 6, 2).atStartOfDay());

        // 응답 workEnd 는 groupEndAt.toLocalTime() = 00:00
        assertThat(response.workEnd()).isEqualTo("00:00");
    }

    @Test
    @DisplayName("자정 시작 공고 (00:00–06:00) → JobPost 1개, 분할 없음")
    void createJobPost_startsAtMidnight_savesOnePost() {
        JobPostCreateRequest req = buildRequest("2026-06-01", "00:00", "06:00");

        jobPostService.createJobPost(req, mockWorkplace, null, null);

        verify(jobPostRepository, times(1)).save(any(JobPost.class));
    }

    // ─── 등록 예외 케이스 ────────────────────────────────────────

    @Test
    @DisplayName("24시간 이상 공고 (09:00–익일 09:00) → TimeSlotSplitter 에서 IllegalArgumentException")
    void createJobPost_exactly24Hours_throws() {
        // 09:00–09:00 → compareTo == 0 → 다음날로 계산 → 정확히 24시간 → IAE
        JobPostCreateRequest req = buildRequest("2026-06-01", "09:00", "09:00");

        assertThatIllegalArgumentException()
                .isThrownBy(() -> jobPostService.createJobPost(req, mockWorkplace, null, null));

        // 잘못된 요청이므로 save 는 호출되면 안 됨
        verify(jobPostRepository, never()).save(any());
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
