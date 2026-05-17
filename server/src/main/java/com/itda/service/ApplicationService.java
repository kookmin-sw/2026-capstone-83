package com.itda.service;

import com.itda.dto.request.ScheduleRequest;
import com.itda.dto.response.ApplicantResponse;
import com.itda.dto.response.ApplicationResponse;
import com.itda.dto.response.CursorPageResponse;
import com.itda.dto.response.calendar.EmployeeScheduleItem;
import com.itda.dto.response.calendar.EmployeeScheduleResponse;
import com.itda.dto.response.calendar.EmployerScheduleItem;
import com.itda.dto.response.calendar.EmployerScheduleResponse;
import com.itda.entity.Application;
import com.itda.entity.JobPost;
import com.itda.entity.User;
import com.itda.enums.ApplicationStatus;
import com.itda.enums.InitiatedBy;
import com.itda.enums.NotificationType;
import com.itda.repository.ApplicationRepository;
import com.itda.repository.JobPostLikeRepository;
import com.itda.repository.JobPostRepository;
import com.itda.exception.DuplicateException;
import com.itda.exception.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import java.util.stream.Collectors;


@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final JobPostRepository jobPostRepository;
    private final JobPostLikeRepository jobPostLikeRepository;
    private final NotificationService notificationService;

    // ─── 구직자 API ───────────────────────────────────────────

    // 지원자 → 공고 지원
    @Transactional
    public Application apply(Long jobPostId, User applicant) {
        applicationRepository.findByJobPostIdAndApplicantUserId(jobPostId, applicant.getId())
                .ifPresent(a -> { throw new DuplicateException("이미 지원한 공고입니다."); });

        JobPost jobPost = jobPostRepository.findById(jobPostId)
                .orElseThrow(() -> new NotFoundException("공고를 찾을 수 없습니다."));

        Application application = Application.builder()
                .jobPost(jobPost)
                .applicantUser(applicant)
                .status(ApplicationStatus.APPLIED)
                .initiatedBy(InitiatedBy.APPLICANT)
                .build();

        Application saved = applicationRepository.save(application);

        // 알림: 고용주에게 새 지원 알림
        Long employerUserId = jobPost.getWorkplace().getEmployer().getUser().getId();
        notificationService.notify(
                employerUserId,
                NotificationType.NEW_APPLICATION,
                applicant.getName() + "님이 [" + jobPost.getTitle() + "]에 지원했습니다.",
                saved.getId()
        );

        return saved;
    }

    // 지원 여부 확인 (구직자)
    public boolean hasApplied(Long jobPostId, Long applicantUserId) {
        return applicationRepository
                .findByJobPostIdAndApplicantUserId(jobPostId, applicantUserId)
                .isPresent();
    }

    // 지원자 → 제안 수락 (OFFERED → PENDING)
    @Transactional
    public Application acceptOffer(Long applicationId) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new NotFoundException("지원 내역을 찾을 수 없습니다."));

        if (application.getStatus() != ApplicationStatus.OFFERED) {
            throw new IllegalStateException("제안 상태가 아닙니다.");
        }

        Application saved = applicationRepository.save(Application.builder()
                .id(application.getId())
                .jobPost(application.getJobPost())
                .applicantUser(application.getApplicantUser())
                .status(ApplicationStatus.PENDING)
                .initiatedBy(application.getInitiatedBy())
                .appliedAt(application.getAppliedAt())
                .build());

        // 알림: 고용주에게 제안 수락 알림
        JobPost jobPost = application.getJobPost();
        Long employerUserId = jobPost.getWorkplace().getEmployer().getUser().getId();
        notificationService.notify(
                employerUserId,
                NotificationType.OFFER_ACCEPTED,
                application.getApplicantUser().getName() + "님이 [" + jobPost.getTitle() + "] 제안을 수락했습니다.",
                saved.getId()
        );

        return saved;
    }

    // 내 지원 목록 (지원자) - 커서 페이지네이션 + 공고 카드 포함 (N+1 방지)
    // liked 포함: 로그인 유저가 각 공고에 좋아요했는지 여부 함께 반환
    public CursorPageResponse<ApplicationResponse> getMyApplications(Long applicantUserId, Long cursor, int size) {
        int fetchSize = size + 1;

        // JOIN FETCH로 jobPost, workplace 한 번에 조회 (N+1 방지)
        List<Application> applications = applicationRepository.findByApplicantUserIdWithCursor(
                applicantUserId, cursor, PageRequest.of(0, fetchSize));

        boolean hasNext = applications.size() > size;
        if (hasNext) {
            applications = applications.subList(0, size);
        }

        // 좋아요한 공고 ID 목록을 한 번에 조회
        List<Long> likedJobPostIds = jobPostLikeRepository.findByUserId(applicantUserId)
                .stream()
                .map(like -> like.getJobPost().getId())
                .toList();

        List<ApplicationResponse> content = applications.stream()
                .map(a -> ApplicationResponse.from(
                        a,
                        likedJobPostIds.contains(a.getJobPost().getId())
                ))
                .toList();

        Long nextCursor = hasNext ? content.get(content.size() - 1).applicationId() : null;
        return CursorPageResponse.of(content, nextCursor, hasNext);
    }

    // 내 지원 목록 (지원자) - status 필터 선택적 + 공고 카드 포함
    public List<ApplicationResponse> getMyApplicationsByStatus(Long applicantUserId, ApplicationStatus status) {
        List<Application> applications = (status != null)
                ? applicationRepository.findByApplicantUserIdAndStatus(applicantUserId, status)
                : applicationRepository.findByApplicantUserId(applicantUserId);

        // 좋아요한 공고 ID 목록을 한 번에 조회
        List<Long> likedJobPostIds = jobPostLikeRepository.findByUserId(applicantUserId)
                .stream()
                .map(like -> like.getJobPost().getId())
                .toList();

        return applications.stream()
                .map(a -> ApplicationResponse.from(
                        a,
                        likedJobPostIds.contains(a.getJobPost().getId())
                ))
                .toList();
    }

    // 구직자 근무 일정 조회
    public EmployeeScheduleResponse getEmployeeSchedules(Long applicantUserId, LocalDate fromDate, LocalDate toDate) {
        List<Application> applications = applicationRepository
                .findByApplicantUserIdAndStatusAndJobPost_WorkDateBetween(
                        applicantUserId, ApplicationStatus.HIRED, fromDate, toDate);

        Map<String, List<EmployeeScheduleItem>> schedules = applications.stream()
                .collect(Collectors.groupingBy(
                        a -> a.getJobPost().getWorkDate().toString(),
                        TreeMap::new,
                        Collectors.mapping(EmployeeScheduleItem::from, Collectors.toList())
                ));

        return EmployeeScheduleResponse.of(schedules);
    }

    // ─── 고용주 API ───────────────────────────────────────────

    // 고용주 → 지원자에게 제안
    @Transactional
    public Application offer(Long jobPostId, User applicant) {
        JobPost jobPost = jobPostRepository.findById(jobPostId)
                .orElseThrow(() -> new NotFoundException("공고를 찾을 수 없습니다."));

        Application application = Application.builder()
                .jobPost(jobPost)
                .applicantUser(applicant)
                .status(ApplicationStatus.OFFERED)
                .initiatedBy(InitiatedBy.EMPLOYER)
                .build();

        Application saved = applicationRepository.save(application);

        // 알림: 구직자에게 채용 제안 알림
        notificationService.notify(
                applicant.getId(),
                NotificationType.OFFER_RECEIVED,
                "[" + jobPost.getTitle() + "]에 채용 제안이 왔습니다.",
                saved.getId()
        );

        return saved;
    }

    // 고용주 → 채용 확정 (소유권 검증)
    @Transactional
    public ApplicantResponse hire(Long applicationId, Long userId) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new NotFoundException("지원 내역을 찾을 수 없습니다."));

        verifyOwnership(application, userId);

        JobPost jobPost = application.getJobPost();
        jobPostRepository.save(JobPost.builder()
                .id(jobPost.getId())
                .workplace(jobPost.getWorkplace())
                .title(jobPost.getTitle())
                .s3ContentUrl(jobPost.getS3ContentUrl())
                .wage(jobPost.getWage())
                .wageType(jobPost.getWageType())
                .workDate(jobPost.getWorkDate())
                .workStart(jobPost.getWorkStart())
                .workEnd(jobPost.getWorkEnd())
                .totalSlots(jobPost.getTotalSlots())
                .filledSlots(jobPost.getFilledSlots() + 1)
                .status(jobPost.getStatus())
                .deadline(jobPost.getDeadline())
                .build());

        Application saved = applicationRepository.save(Application.builder()
                .id(application.getId())
                .jobPost(application.getJobPost())
                .applicantUser(application.getApplicantUser())
                .status(ApplicationStatus.HIRED)
                .initiatedBy(application.getInitiatedBy())
                .appliedAt(application.getAppliedAt())
                .build());

        // 알림: 구직자에게 채용 확정 알림
        notificationService.notify(
                application.getApplicantUser().getId(),
                NotificationType.HIRED,
                "[" + jobPost.getTitle() + "] 채용이 확정되었습니다.",
                saved.getId()
        );

        return toApplicantResponse(saved);
    }

    // 고용주 → 거절 (소유권 검증)
    @Transactional
    public ApplicantResponse reject(Long applicationId, Long userId) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new NotFoundException("지원 내역을 찾을 수 없습니다."));

        verifyOwnership(application, userId);

        Application saved = applicationRepository.save(Application.builder()
                .id(application.getId())
                .jobPost(application.getJobPost())
                .applicantUser(application.getApplicantUser())
                .status(ApplicationStatus.REJECTED)
                .initiatedBy(application.getInitiatedBy())
                .appliedAt(application.getAppliedAt())
                .build());

        // 알림: 구직자에게 거절 알림
        JobPost jobPost = application.getJobPost();
        notificationService.notify(
                application.getApplicantUser().getId(),
                NotificationType.REJECTED,
                "[" + jobPost.getTitle() + "] 지원이 거절되었습니다.",
                saved.getId()
        );

        return toApplicantResponse(saved);
    }

    // 근무 완료 처리 (고용주, 소유권 검증)
    @Transactional
    public ApplicantResponse complete(Long applicationId, Long userId) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new NotFoundException("지원 내역을 찾을 수 없습니다."));

        verifyOwnership(application, userId);

        Application saved = applicationRepository.save(Application.builder()
                .id(application.getId())
                .jobPost(application.getJobPost())
                .applicantUser(application.getApplicantUser())
                .status(ApplicationStatus.COMPLETED)
                .initiatedBy(application.getInitiatedBy())
                .appliedAt(application.getAppliedAt())
                .build());

        // 알림: 구직자에게 근무 완료 알림
        JobPost jobPost = application.getJobPost();
        notificationService.notify(
                application.getApplicantUser().getId(),
                NotificationType.WORK_COMPLETED,
                "[" + jobPost.getTitle() + "] 근무가 완료 처리되었습니다.",
                saved.getId()
        );

        return toApplicantResponse(saved);
    }

    // 공고별 지원자 목록 (고용주, 소유권 검증 + 커서 페이지네이션)
    public CursorPageResponse<ApplicantResponse> getApplicationsByJobPost(Long jobPostId, Long userId, Long cursor, int size) {
        JobPost jobPost = jobPostRepository.findById(jobPostId)
                .orElseThrow(() -> new NotFoundException("공고를 찾을 수 없습니다."));

        if (!jobPost.getWorkplace().getEmployer().getUser().getId().equals(userId)) {
            throw new IllegalStateException("본인의 공고만 조회할 수 있습니다.");
        }

        int fetchSize = size + 1;
        List<Application> applications = applicationRepository.findByJobPostIdWithCursor(
                jobPostId, cursor, PageRequest.of(0, fetchSize));

        boolean hasNext = applications.size() > size;
        if (hasNext) {
            applications = applications.subList(0, size);
        }

        List<ApplicantResponse> content = applications.stream()
                .map(this::toApplicantResponse)
                .toList();

        Long nextCursor = hasNext ? applications.get(applications.size() - 1).getId() : null;
        return CursorPageResponse.of(content, nextCursor, hasNext);
    }

    // 공고별 근무자 목록 (고용주, 소유권 검증)
    public List<ApplicantResponse> getWorkersByJobPost(Long jobPostId, Long userId) {
        JobPost jobPost = jobPostRepository.findById(jobPostId)
                .orElseThrow(() -> new NotFoundException("공고를 찾을 수 없습니다."));

        if (!jobPost.getWorkplace().getEmployer().getUser().getId().equals(userId)) {
            throw new IllegalStateException("본인의 공고만 조회할 수 있습니다.");
        }

        List<Application> applications = applicationRepository.findByJobPostIdAndStatus(jobPostId, ApplicationStatus.HIRED);
        return applications.stream()
                .map(this::toApplicantResponse)
                .toList();
    }

    // ─── 캘린더 API ───────────────────────────────────────────

    // 고용자 캘린더 일정 조회
    public EmployerScheduleResponse getEmployerSchedules(Long userId, ScheduleRequest request) {
        List<JobPost> jobPosts = jobPostRepository.findByEmployerIdAndWorkDateBetween(
                userId, request.getFromDate(), request.getToDate());

        Map<LocalDate, List<EmployerScheduleItem>> schedules = jobPosts.stream()
                .collect(Collectors.groupingBy(
                        JobPost::getWorkDate,
                        Collectors.mapping(
                                jobPost -> {
                                    List<Application> applications = applicationRepository.findByJobPostId(jobPost.getId());
                                    int applicantCount = applications.size();
                                    int hiredCount = (int) applications.stream()
                                            .filter(a -> a.getStatus() == ApplicationStatus.HIRED)
                                            .count();
                                    return EmployerScheduleItem.from(jobPost, applicantCount, hiredCount);
                                },
                                Collectors.toList()
                        )
                ));

        return EmployerScheduleResponse.of(schedules);
    }

    // ─── 내부 헬퍼 ───────────────────────────────────────────

    // 소유권 검증: 해당 공고의 고용주인지 확인
    private void verifyOwnership(Application application, Long userId) {
        if (!application.getJobPost().getWorkplace().getEmployer().getUser().getId().equals(userId)) {
            throw new IllegalStateException("본인의 공고만 처리할 수 있습니다.");
        }
    }

    // Application → ApplicantResponse 변환 (매칭 횟수 포함)
    private ApplicantResponse toApplicantResponse(Application application) {
        Long userId = application.getApplicantUser().getId();
        long matchCount = applicationRepository.countByApplicantUserIdAndStatusIn(
                userId, List.of(ApplicationStatus.HIRED, ApplicationStatus.COMPLETED));
        return ApplicantResponse.from(application, matchCount);
    }
}