package com.itda.service;

import com.itda.dto.request.ScheduleRequest;
import com.itda.dto.request.BulkOfferRequest;
import com.itda.dto.response.ApplicantResponse;
import com.itda.dto.response.ApplicationResponse;
import com.itda.dto.response.BulkOfferResponse;
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
import com.itda.enums.UserRole;
import com.itda.enums.JobPostStatus;
import com.itda.repository.ApplicationRepository;
import com.itda.repository.JobPostLikeRepository;
import com.itda.repository.JobPostRepository;
import com.itda.repository.LongTermWorkerRepository;
import com.itda.repository.ResumeLikeRepository;
import com.itda.repository.ResumeRepository;
import com.itda.repository.UserRepository;
import com.itda.exception.DuplicateException;
import com.itda.exception.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.access.AccessDeniedException;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TreeMap;
import java.util.stream.Collectors;


@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final JobPostRepository jobPostRepository;
    private final JobPostLikeRepository jobPostLikeRepository;
    private final ResumeRepository resumeRepository;
    private final NotificationService notificationService;
    private final UserRepository userRepository;
    private final LongTermWorkerRepository longTermWorkerRepository;
    private final ResumeLikeRepository resumeLikeRepository;


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
                .instantHire(false)
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

    /**
     * 구직자의 오퍼 수락 처리.
     *
     * <ul>
     *   <li>일반 오퍼 ({@code instantHire=false}): OFFERED → PENDING (고용주 최종 확정 대기)</li>
     *   <li>즉시 채용 오퍼 ({@code instantHire=true}): OFFERED → HIRED
     *       (장기근무자·이력서 좋아요 대상에게 발송된 오퍼 — filledSlots 증가 포함)</li>
     * </ul>
     *
     * 분기 정책은 오퍼 발송 시점에 {@code Application.instantHire} 로 스냅샷 저장되어 있으므로
     * 수락 시점에는 그 값만 보고 라우팅한다.
     */
    @Transactional
    public Application acceptOffer(Long applicationId, User applicant) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new NotFoundException("지원 내역을 찾을 수 없습니다."));

        if (!application.getApplicantUser().getId().equals(applicant.getId())) {
            throw new AccessDeniedException("본인의 지원만 수락할 수 있습니다.");
        }
        if (application.getStatus() != ApplicationStatus.OFFERED) {
            throw new IllegalStateException("현재 상태에서는 수락할 수 없습니다.");
        }

        return application.isInstantHire()
                ? processInstantHire(application)
                : processRegularOffer(application);
    }

    /** 즉시 채용: OFFERED → HIRED */
    private Application processInstantHire(Application application) {
        JobPost jobPost = application.getJobPost();
        jobPost.confirmHire();
        jobPostRepository.save(jobPost);

        Application saved = applicationRepository.save(Application.builder()
                .id(application.getId())
                .jobPost(jobPost)
                .applicantUser(application.getApplicantUser())
                .status(ApplicationStatus.HIRED)
                .initiatedBy(application.getInitiatedBy())
                .instantHire(true)
                .appliedAt(application.getAppliedAt())
                .build());

        Long employerUserId = jobPost.getWorkplace().getEmployer().getUser().getId();
        notificationService.notify(
                employerUserId,
                NotificationType.OFFER_ACCEPTED,
                application.getApplicantUser().getName() + "님이 ["
                        + jobPost.getTitle() + "] 채용을 수락했습니다.",
                saved.getId());
        notificationService.notify(
                application.getApplicantUser().getId(),
                NotificationType.HIRED,
                "[" + jobPost.getTitle() + "] 채용이 확정되었습니다.",
                saved.getId());
        return saved;
    }

    /** 일반 오퍼: OFFERED → PENDING */
    private Application processRegularOffer(Application application) {
        JobPost jobPost = application.getJobPost();
        Application saved = applicationRepository.save(Application.builder()
                .id(application.getId())
                .jobPost(jobPost)
                .applicantUser(application.getApplicantUser())
                .status(ApplicationStatus.PENDING)
                .initiatedBy(application.getInitiatedBy())
                .instantHire(false)
                .appliedAt(application.getAppliedAt())
                .build());

        Long employerUserId = jobPost.getWorkplace().getEmployer().getUser().getId();
        notificationService.notify(
                employerUserId,
                NotificationType.OFFER_ACCEPTED,
                application.getApplicantUser().getName() + "님이 ["
                        + jobPost.getTitle() + "] 제안을 수락했습니다.",
                saved.getId());
        return saved;
    }

    // 지원자 → 고용주 승인 후 최종 수락 (PENDING → HIRED, APPLICANT 플로우)
    @Transactional
    public Application acceptApproval(Long applicationId) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new NotFoundException("지원 내역을 찾을 수 없습니다."));

        if (application.getStatus() != ApplicationStatus.PENDING
                || application.getInitiatedBy() != InitiatedBy.APPLICANT) {
            throw new IllegalStateException("현재 상태에서는 수락할 수 없습니다.");
        }

        JobPost jobPost = application.getJobPost();
        jobPost.confirmHire();
        jobPostRepository.save(jobPost);

        Application saved = applicationRepository.save(Application.builder()
                .id(application.getId())
                .jobPost(jobPost)
                .applicantUser(application.getApplicantUser())
                .status(ApplicationStatus.HIRED)
                .initiatedBy(application.getInitiatedBy())
                .instantHire(application.isInstantHire())
                .appliedAt(application.getAppliedAt())
                .build());

        Long employerUserId = jobPost.getWorkplace().getEmployer().getUser().getId();
        notificationService.notify(
                employerUserId,
                NotificationType.OFFER_ACCEPTED,
                application.getApplicantUser().getName() + "님이 [" + jobPost.getTitle() + "] 채용을 수락했습니다.",
                saved.getId()
        );
        notificationService.notify(
                application.getApplicantUser().getId(),
                NotificationType.HIRED,
                "[" + jobPost.getTitle() + "] 채용이 확정되었습니다.",
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

    // 구직자 근무 일정 조회 (APPLIED: 지원중 / HIRED: 확정된 근무 / PENDING: 채용 대기중 / COMPLETED : 근무 완료)
    public EmployeeScheduleResponse getEmployeeSchedules(Long applicantUserId, LocalDate fromDate, LocalDate toDate) {
        List<Application> applications = applicationRepository
                .findByApplicantUserIdAndStatusInAndJobPost_WorkDateBetween(
                        applicantUserId,
                        List.of(ApplicationStatus.APPLIED, ApplicationStatus.HIRED, ApplicationStatus.PENDING, ApplicationStatus.COMPLETED),                        fromDate, toDate);

        Map<String, List<EmployeeScheduleItem>> schedules = applications.stream()
                .collect(Collectors.groupingBy(
                        a -> a.getJobPost().getWorkDate().toString(),
                        TreeMap::new,
                        Collectors.mapping(EmployeeScheduleItem::from, Collectors.toList())
                ));

        return EmployeeScheduleResponse.of(schedules);
    }

    // 지원 취소 (구직자)
    @Transactional
    public void cancel(Long applicationId, User applicant) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new NotFoundException("지원 내역을 찾을 수 없습니다."));

        if (!application.getApplicantUser().getId().equals(applicant.getId())) {
            throw new IllegalStateException("본인의 지원 내역만 취소할 수 있습니다.");
        }

        ApplicationStatus current = application.getStatus();
        if (current == ApplicationStatus.COMPLETED
                || current == ApplicationStatus.REJECTED
                || current == ApplicationStatus.CANCELLED) {
            throw new IllegalStateException("현재 상태에서는 취소할 수 없습니다.");
        }

        // HIRED 취소인 경우 → filledSlots 감소 + 공고 재오픈 판단
        if (current == ApplicationStatus.HIRED) {
            JobPost jobPost = application.getJobPost();
            jobPost.cancelHire();
            jobPostRepository.save(jobPost);
        }

        // 레코드 삭제 없이 상태만 CANCELLED로 변경
        application.cancel();
        applicationRepository.save(application);
    }

    // ─── 고용주 API ───────────────────────────────────────────

    // 고용주 → 지원자에게 제안
    @Transactional
    public Application offer(Long jobPostId, User employer, User applicant) {
        JobPost jobPost = jobPostRepository.findById(jobPostId)
                .orElseThrow(() -> new NotFoundException("공고를 찾을 수 없습니다."));

        // 공고 소유권 검증
        if (!jobPost.getWorkplace().getEmployer().getUser().getId().equals(employer.getId())) {
            throw new AccessDeniedException("본인의 공고만 제안할 수 있습니다.");
        }
        // 구직자 역할 검증
        if (applicant.getRole() != UserRole.APPLICANT) {
            throw new IllegalStateException("구직자에게만 제안할 수 있습니다.");
        }
        // 공고 상태 검증
        if (jobPost.getStatus() != JobPostStatus.OPEN) {
            throw new IllegalStateException("모집 중인 공고만 제안할 수 있습니다.");
        }

        // 오퍼 발송 시점에 즉시 채용 여부 결정 (정책 스냅샷)
        boolean isInstant = isInstantHireTarget(employer.getId(), applicant.getId());
        String offerMessage = isInstant
                ? "[" + jobPost.getTitle() + "] 채용 제안이 왔습니다. 수락하면 바로 채용이 확정됩니다."
                : "[" + jobPost.getTitle() + "]에 채용 제안이 왔습니다.";

        // 중복 제안 처리
        Application existing = applicationRepository
                .findByJobPostIdAndApplicantUserId(jobPostId, applicant.getId())
                .orElse(null);

        if (existing != null) {
            ApplicationStatus s = existing.getStatus();
            // 재제안 가능: REJECTED 또는 CANCELLED
            if (s == ApplicationStatus.REJECTED || s == ApplicationStatus.CANCELLED) {
                Application updated = applicationRepository.save(Application.builder()
                        .id(existing.getId())
                        .jobPost(existing.getJobPost())
                        .applicantUser(existing.getApplicantUser())
                        .status(ApplicationStatus.OFFERED)
                        .initiatedBy(InitiatedBy.EMPLOYER)
                        .instantHire(isInstant)
                        .appliedAt(existing.getAppliedAt())
                        .build());

                notificationService.notify(
                        applicant.getId(), NotificationType.OFFER_RECEIVED,
                        offerMessage, updated.getId());
                return updated;
            }
            // 활성 상태면 차단
            throw new DuplicateException("이미 진행 중인 지원 또는 제안이 있습니다.");
        }

        // 신규 제안
        Application saved = applicationRepository.save(Application.builder()
                .jobPost(jobPost)
                .applicantUser(applicant)
                .status(ApplicationStatus.OFFERED)
                .initiatedBy(InitiatedBy.EMPLOYER)
                .instantHire(isInstant)
                .build());

        notificationService.notify(
                applicant.getId(), NotificationType.OFFER_RECEIVED,
                offerMessage, saved.getId());

        return saved;
    }

    // 고용주 → 채용 확정 (소유권 검증) — APPLIED → PENDING (구직자 수락 대기)
    @Transactional
    public ApplicantResponse hire(Long applicationId, Long userId) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new NotFoundException("지원 내역을 찾을 수 없습니다."));

        verifyOwnership(application, userId);

        Application saved = applicationRepository.save(Application.builder()
                .id(application.getId())
                .jobPost(application.getJobPost())
                .applicantUser(application.getApplicantUser())
                .status(ApplicationStatus.PENDING)
                .initiatedBy(application.getInitiatedBy())
                .instantHire(application.isInstantHire())
                .appliedAt(application.getAppliedAt())
                .build());

        // 알림: 구직자에게 채용 제안 알림
        JobPost jobPost = application.getJobPost();
        notificationService.notify(
                application.getApplicantUser().getId(),
                NotificationType.OFFER_RECEIVED,
                "[" + jobPost.getTitle() + "] 채용 제안이 왔습니다.",
                saved.getId()
        );

        return toApplicantResponse(saved);
    }

    // 고용주 → 최종 채용 확정 (OFFERED 플로우: 구직자 수락 후 고용주 최종 확정) PENDING → HIRED
    @Transactional
    public ApplicantResponse confirmHire(Long applicationId, Long userId) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new NotFoundException("지원 내역을 찾을 수 없습니다."));

        verifyOwnership(application, userId);

        if (application.getStatus() != ApplicationStatus.PENDING) {
            throw new IllegalStateException("구직자가 제안을 수락한 상태에서만 최종 확정할 수 있습니다.");
        }

        JobPost jobPost = application.getJobPost();
        jobPost.confirmHire();
        jobPostRepository.save(jobPost);

        Application saved = applicationRepository.save(Application.builder()
                .id(application.getId())
                .jobPost(jobPost)
                .applicantUser(application.getApplicantUser())
                .status(ApplicationStatus.HIRED)
                .initiatedBy(application.getInitiatedBy())
                .instantHire(application.isInstantHire())
                .appliedAt(application.getAppliedAt())
                .build());

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
                .instantHire(application.isInstantHire())
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
                .instantHire(application.isInstantHire())
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

    // 채용 취소 (고용주, 소유권 검증)
    @Transactional
    public ApplicantResponse cancelHire(Long applicationId, Long userId) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new NotFoundException("지원 내역을 찾을 수 없습니다."));

        verifyOwnership(application, userId);

        if (application.getStatus() != ApplicationStatus.HIRED) {
            throw new IllegalStateException("채용 확정 상태에서만 취소할 수 있습니다.");
        }

        // filledSlots 감소 + 공고 재오픈 판단
        JobPost jobPost = application.getJobPost();
        jobPost.cancelHire();
        jobPostRepository.save(jobPost);

        // 상태를 CANCELLED로 변경
        application.cancel();
        applicationRepository.save(application);

        // 알림: 구직자에게 채용 취소 알림
        notificationService.notify(
                application.getApplicantUser().getId(),
                NotificationType.REJECTED,
                "[" + jobPost.getTitle() + "] 채용이 취소되었습니다.",
                application.getId()
        );

        return toApplicantResponse(application);
    }
    // 일괄 오퍼 발송 (반자동, 소유권 검증)
    @Transactional
    public BulkOfferResponse bulkOffer(Long jobPostId, BulkOfferRequest request, User employer) {
        JobPost jobPost = jobPostRepository.findById(jobPostId)
                .orElseThrow(() -> new NotFoundException("공고를 찾을 수 없습니다."));

        // 소유권 검증
        if (!jobPost.getWorkplace().getEmployer().getUser().getId().equals(employer.getId())) {
            throw new AccessDeniedException("본인의 공고만 제안할 수 있습니다.");
        }

        // 날짜 겹침 제외 대상
        List<Long> excludedByDate = applicationRepository
                .findByJobPost_WorkDateAndStatusIn(
                        jobPost.getWorkDate(),
                        List.of(ApplicationStatus.HIRED, ApplicationStatus.PENDING))
                .stream().map(a -> a.getApplicantUser().getId()).toList();

        // 중복 지원 제외 대상
        List<Long> excludedByDuplicate = applicationRepository
                .findByJobPostId(jobPostId)
                .stream().map(a -> a.getApplicantUser().getId()).toList();

        // 즉시 채용 대상 배치 조회 (N+1 방지)
        List<Long> allUserIds = request.userIds();
        Set<Long> instantHireUserIds = new java.util.HashSet<>();
        instantHireUserIds.addAll(
                longTermWorkerRepository.findApplicantUserIdsByEmployerAndApplicantsIn(
                        employer.getId(), allUserIds));
        instantHireUserIds.addAll(
                resumeLikeRepository.findApplicantUserIdsLikedByEmployer(
                        employer.getId(), allUserIds));

        int offeredCount = 0;
        int skippedCount = 0;

        for (Long userId : allUserIds) {
            // 날짜 겹침 or 중복 지원이면 스킵
            if (excludedByDate.contains(userId) || excludedByDuplicate.contains(userId)) {
                skippedCount++;
                continue;
            }

            User applicant = userRepository.findById(userId).orElse(null);
            if (applicant == null) {
                skippedCount++;
                continue;
            }

            boolean isInstant = instantHireUserIds.contains(userId);
            String offerMessage = isInstant
                    ? "[" + jobPost.getTitle() + "] 채용 제안이 왔습니다. 수락하면 바로 채용이 확정됩니다."
                    : "[" + jobPost.getTitle() + "]에 채용 제안이 왔습니다.";

            Application saved = applicationRepository.save(Application.builder()
                    .jobPost(jobPost)
                    .applicantUser(applicant)
                    .status(ApplicationStatus.OFFERED)
                    .initiatedBy(InitiatedBy.EMPLOYER)
                    .instantHire(isInstant)
                    .build());

            notificationService.notify(
                    userId, NotificationType.OFFER_RECEIVED,
                    offerMessage, saved.getId());

            offeredCount++;
        }

        return new BulkOfferResponse(offeredCount, skippedCount);
    }

    // ─── 캘린더 API ───────────────────────────────────────────

    // 고용자 캘린더 일정 조회 (전체 사업장 — 프론트에서 workplaceId로 필터)
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

    /**
     * (고용주, 구직자) 조합이 즉시 채용 오퍼 대상인지 판정.
     * 다음 조건 중 하나라도 만족하면 true:
     *   - 고용주가 해당 구직자를 장기근무자로 등록
     *   - 고용주가 해당 구직자의 이력서를 좋아요
     */
    private boolean isInstantHireTarget(Long employerUserId, Long applicantUserId) {
        if (longTermWorkerRepository.existsByEmployerUserIdAndApplicantUserId(
                employerUserId, applicantUserId)) {
            return true;
        }
        return resumeRepository.findByUserId(applicantUserId)
                .map(resume -> resumeLikeRepository.existsByEmployerUserIdAndResumeId(
                        employerUserId, resume.getId()))
                .orElse(false);
    }

    // 소유권 검증: 해당 공고의 고용주인지 확인
    private void verifyOwnership(Application application, Long userId) {
        if (!application.getJobPost().getWorkplace().getEmployer().getUser().getId().equals(userId)) {
            throw new IllegalStateException("본인의 공고만 처리할 수 있습니다.");
        }
    }

    // Application → ApplicantResponse 변환 (매칭 횟수 + 이력서 ID 포함)
    private ApplicantResponse toApplicantResponse(Application application) {
        Long userId = application.getApplicantUser().getId();
        long matchCount = applicationRepository.countByApplicantUserIdAndStatusIn(
                userId, List.of(ApplicationStatus.HIRED, ApplicationStatus.COMPLETED));
        Long resumeId = resumeRepository.findByUserId(userId)
                .map(resume -> resume.getId())
                .orElse(null);
        return ApplicantResponse.from(application, matchCount, resumeId);
    }
}