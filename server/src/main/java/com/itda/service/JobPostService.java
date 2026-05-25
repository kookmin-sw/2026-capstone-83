package com.itda.service;

import com.itda.dto.request.JobPostCreateRequest;
import com.itda.dto.request.JobPostUpdateRequest;
import com.itda.dto.request.JobPostFilterRequest;
import com.itda.dto.request.BulkOfferRequest;
import com.itda.dto.response.CursorPageResponse;
import com.itda.dto.response.JobPostCardResponse;
import com.itda.dto.response.JobPostDetailResponse;
import com.itda.dto.response.OfferTargetResponse;
import com.itda.entity.Application;
import com.itda.entity.JobPost;
import com.itda.entity.User;
import com.itda.entity.Workplace;
import com.itda.enums.ApplicationStatus;
import com.itda.enums.InitiatedBy;
import com.itda.enums.JobPostStatus;
import com.itda.enums.NotificationType;
import com.itda.enums.WageType;
import com.itda.enums.UserRole;
import com.itda.exception.NotFoundException;
import com.itda.repository.ApplicationRepository;
import com.itda.repository.JobPostLikeRepository;
import com.itda.repository.JobPostRepository;
import com.itda.repository.WorkplaceRepository;
import com.itda.repository.LongTermWorkerRepository;
import com.itda.repository.UserRepository;
import com.itda.service.event.AutoMatchEvents;
import com.itda.service.event.InteractionEvents;
import com.itda.service.util.TimeSlotSplitter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class JobPostService {

    private final JobPostRepository jobPostRepository;
    private final ApplicationRepository applicationRepository;
    private final JobPostLikeRepository jobPostLikeRepository;
    private final LikeService likeService;
    private final S3Service s3Service;
    private final NotificationService notificationService;
    private final WorkplaceRepository workplaceRepository;
    private final JobPostRankingService rankingService;
    private final ApplicationEventPublisher eventPublisher;
    private final LongTermWorkerRepository longTermWorkerRepository;
    private final UserRepository userRepository;
    private final ApplicationService applicationService;

    // ─── 조회 ────────────────────────────────────────────────────

    /**
     * 공고 목록 통합 조회 (필터 + 커서 페이지네이션).
     * RECOMMENDED 정렬 + APPLICANT 로그인 사용자면 개인화 랭킹으로 위임.
     *
     * @param requestId 컨트롤러에서 생성한 UUID. 노출 로그를 한 응답으로 묶기 위한 식별자.
     */
    public CursorPageResponse<JobPostCardResponse> getJobPosts(
            JobPostFilterRequest filter, User user, String requestId) {

        CursorPageResponse<JobPostCardResponse> response;

        if ("RECOMMENDED".equalsIgnoreCase(filter.sortType())
                && user != null
                && user.getRole() == UserRole.APPLICANT) {
            response = rankingService.recommend(user, filter.cursor(), filter.getSize());
        } else {
            int fetchSize = filter.getSize() + 1;
            List<JobPost> posts = jobPostRepository.findByDynamicFilter(filter, fetchSize);

            boolean hasNext = posts.size() > filter.getSize();
            if (hasNext) posts = posts.subList(0, filter.getSize());

            List<Long> likedIds = (user != null)
                    ? likeService.getLikedJobPostIds(user.getId())
                    : List.of();

            List<JobPostCardResponse> jobPosts = posts.stream()
                    .map(j -> JobPostCardResponse.from(j, likedIds.contains(j.getId())))
                    .toList();

            Long nextCursor = hasNext ? jobPosts.get(jobPosts.size() - 1).id() : null;
            response = CursorPageResponse.of(jobPosts, nextCursor, hasNext);
        }

        publishImpressionEvent(response, filter.sortType(), user, requestId);
        return response;
    }

    /** 공고 상세 조회 — liked 포함. */
    public JobPostDetailResponse getJobPost(Long id, User user,
                                            String requestId, String referrerSortType) {
        JobPost post = jobPostRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("공고를 찾을 수 없습니다."));

        boolean liked = (user != null)
                && jobPostLikeRepository.existsByUserIdAndJobPostId(user.getId(), id);

        eventPublisher.publishEvent(new InteractionEvents.ClickEvent(
                requestId,
                user != null ? user.getId() : null,
                id,
                referrerSortType,
                LocalDateTime.now()
        ));

        return JobPostDetailResponse.from(post, liked);
    }

    /** 고용주 본인 공고 목록 조회 (커서 페이지네이션, status 필터 선택적). */
    public CursorPageResponse<JobPostCardResponse> getJobPostsByEmployer(
            Long userId, Long cursor, int size, String status) {
        int fetchSize = size + 1;

        JobPostStatus statusEnum = (status != null) ? JobPostStatus.valueOf(status) : null;

        List<JobPost> posts = (statusEnum != null)
                ? jobPostRepository.findByEmployerIdAndStatusWithCursor(userId, statusEnum, cursor, PageRequest.of(0, fetchSize))
                : jobPostRepository.findByEmployerIdWithCursor(userId, cursor, PageRequest.of(0, fetchSize));

        boolean hasNext = posts.size() > size;
        if (hasNext) posts = posts.subList(0, size);

        List<JobPostCardResponse> content = posts.stream()
                .map(j -> JobPostCardResponse.from(j, false))
                .toList();

        Long nextCursor = hasNext ? content.get(content.size() - 1).id() : null;
        return CursorPageResponse.of(content, nextCursor, hasNext);
    }

    /** 캘린더용 날짜 범위 공고 조회. */
    public List<JobPost> getJobPostsByDateRange(Long userId, LocalDate start, LocalDate end) {
        return jobPostRepository.findByEmployerIdAndWorkDateBetween(userId, start, end);
    }

    // ─── 등록 ────────────────────────────────────────────────────

    /**
     * 공고 등록 — 이미지 파일 S3 업로드 후 URL 저장.
     *
     * <p>자정 넘김 공고(workEnd &lt;= workStart)는 {@link TimeSlotSplitter} 로 분할 저장된다.
     * 분할 시 Day1·Day2 레코드가 생성되고 대표(Day1)를 응답으로 반환한다.
     */
    @Transactional
    public JobPostDetailResponse createJobPost(
            JobPostCreateRequest request,
            Workplace workplace,
            MultipartFile companyLogoImage,
            MultipartFile descriptionImage) {

        // 회사 로고 이미지가 있으면 S3 업로드 후 Workplace 에 URL 저장
        if (companyLogoImage != null && !companyLogoImage.isEmpty()) {
            String logoUrl = s3Service.upload(companyLogoImage, "uploads/logos");
            workplaceRepository.save(Workplace.builder()
                    .id(workplace.getId())
                    .employer(workplace.getEmployer())
                    .name(workplace.getName())
                    .companyName(workplace.getCompanyName())
                    .businessNumber(workplace.getBusinessNumber())
                    .address(workplace.getAddress())
                    .companyLogoUrl(logoUrl)
                    .build());
        }

        // 공고 상세 이미지 처리
        String contentUrl;
        if (descriptionImage != null && !descriptionImage.isEmpty()) {
            contentUrl = s3Service.upload(descriptionImage, S3Service.PATH_JOB_POSTS);
        } else if (request.getExistingImageUrl() != null && !request.getExistingImageUrl().isBlank()) {
            contentUrl = request.getExistingImageUrl();
        } else {
            contentUrl = null;
        }

        // 자정 분할 처리
        List<JobPost> savedPosts = splitAndSaveJobPosts(request, workplace, contentUrl);

        // Day1(이른 날짜) 레코드를 대표로 응답 반환
        JobPost day1 = savedPosts.get(0);

        // 자동 오퍼 처리 (autoOfferEnabled=true인 경우)
        if (Boolean.TRUE.equals(request.getAutoOfferEnabled())) {
            List<Long> targetIds = getOfferTargetIds(day1, workplace.getEmployer().getUser().getId());
            if (!targetIds.isEmpty()) {
                applicationService.bulkOffer(day1.getId(),
                        new BulkOfferRequest(targetIds),
                        workplace.getEmployer().getUser());
            }
        }

        // 자동 매칭 이벤트 발행 — 비동기 리스너가 별도 스레드에서 처리
        eventPublisher.publishEvent(new AutoMatchEvents.JobPostCreatedEvent(
                day1.getId(),
                day1.getLinkedGroupId(),
                day1.getGroupStartAt(),
                day1.getGroupEndAt(),
                workplace.getEmployer().getUser().getId()));

        return JobPostDetailResponse.from(day1, false);
    }

    // ─── 수정 ────────────────────────────────────────────────────

    /**
     * 공고 수정 (부분 수정 — null 필드는 Day1 기존값 유지, 본인 공고만).
     *
     * <p>시간 필드(workDate/workStart/workEnd) 가 변경될 경우:
     * <ul>
     *   <li>분할 구조(1↔2 레코드) 가 바뀌면 {@link IllegalStateException} — 삭제 후 재등록 권장.</li>
     *   <li>분할 구조가 유지되면 그룹 전체 레코드의 날짜·시간·그룹 컬럼을 재계산.</li>
     * </ul>
     * 비시간 필드(title, wage 등)는 그룹 전체에 동일하게 적용된다.
     */
    @Transactional
    public JobPostDetailResponse updateJobPost(Long jobPostId, JobPostUpdateRequest request,
                                               MultipartFile descriptionImage, Long userId) {
        JobPost jobPost = jobPostRepository.findById(jobPostId)
                .orElseThrow(() -> new NotFoundException("공고를 찾을 수 없습니다."));
        verifyJobPostOwnership(jobPost, userId);

        // 이미지 처리 (기존 로직 유지)
        String s3ContentUrl = jobPost.getS3ContentUrl();
        if (descriptionImage != null && !descriptionImage.isEmpty()) {
            s3Service.delete(s3ContentUrl);
            s3ContentUrl = s3Service.upload(descriptionImage, S3Service.PATH_JOB_POSTS);
        }

        // 그룹 전체 조회 — 날짜 오름차순(Day1 = index 0)
        List<JobPost> groupPosts = jobPostRepository.findByLinkedGroupId(jobPost.getLinkedGroupId());
        groupPosts.sort(Comparator.comparing(JobPost::getWorkDate));
        JobPost day1 = groupPosts.get(0);

        // 시간 변경 여부 판단
        boolean timeFieldsChanged = request.workDate() != null
                || request.workStart() != null
                || request.workEnd() != null;

        List<TimeSlotSplitter.Slice> newSlices;
        String groupId = jobPost.getLinkedGroupId();
        LocalDateTime newGroupStartAt;
        LocalDateTime newGroupEndAt;

        if (timeFieldsChanged) {
            // 원본 workEnd 복원: Day1 의 workEnd 가 LocalTime.MAX 이면 groupEndAt 에서 읽음
            LocalDate baseDate  = day1.getWorkDate();
            LocalTime baseStart = day1.getWorkStart();
            LocalTime baseEnd   = (day1.getGroupEndAt() != null)
                    ? day1.getGroupEndAt().toLocalTime()
                    : day1.getWorkEnd(); // migration 전 old data 대비 fallback

            LocalDate  newDate  = request.workDate()  != null ? LocalDate.parse(request.workDate())  : baseDate;
            LocalTime  newStart = request.workStart() != null ? LocalTime.parse(request.workStart()) : baseStart;
            LocalTime  newEnd   = request.workEnd()   != null ? LocalTime.parse(request.workEnd())   : baseEnd;

            LocalDateTime newStartAt = LocalDateTime.of(newDate, newStart);
            // workEnd <= workStart 이면 자정 넘김 (다음날로 계산)
            LocalDateTime newEndAt = newEnd.compareTo(newStart) <= 0
                    ? LocalDateTime.of(newDate.plusDays(1), newEnd)
                    : LocalDateTime.of(newDate, newEnd);

            TimeSlotSplitter.Split newSplit = TimeSlotSplitter.split(newStartAt, newEndAt);

            // V1: 분할 구조 변경(1↔2 레코드)은 거부
            if (newSplit.slices().size() != groupPosts.size()) {
                throw new IllegalStateException(
                        "시간 수정으로 분할 구조가 변경됩니다. 기존 공고를 삭제 후 새로 등록해 주세요.");
            }

            newSlices       = newSplit.slices();
            newGroupStartAt = newSplit.groupStartAt();
            newGroupEndAt   = newSplit.groupEndAt();
        } else {
            // 시간 변경 없음 → 기존 slice 정보 그대로
            newSlices = groupPosts.stream()
                    .map(gp -> new TimeSlotSplitter.Slice(
                            gp.getWorkDate(), gp.getWorkStart(), gp.getWorkEnd()))
                    .toList();
            // migration 전 데이터도 안전하게 처리
            newGroupStartAt = day1.getGroupStartAt() != null
                    ? day1.getGroupStartAt()
                    : LocalDateTime.of(day1.getWorkDate(), day1.getWorkStart());
            newGroupEndAt = day1.getGroupEndAt() != null
                    ? day1.getGroupEndAt()
                    : LocalDateTime.of(day1.getWorkDate(), day1.getWorkEnd());
        }

        // 그룹 내 모든 레코드 업데이트 — 비시간 필드는 Day1 기존값 기준
        final String finalS3ContentUrl = s3ContentUrl;
        final LocalDateTime finalGroupStartAt = newGroupStartAt;
        final LocalDateTime finalGroupEndAt   = newGroupEndAt;

        List<JobPost> updatedPosts = new ArrayList<>();
        for (int i = 0; i < groupPosts.size(); i++) {
            JobPost gp    = groupPosts.get(i);
            TimeSlotSplitter.Slice slice = newSlices.get(i);

            updatedPosts.add(jobPostRepository.save(JobPost.builder()
                    .id(gp.getId())
                    .workplace(gp.getWorkplace())
                    .title(          request.title()          != null ? request.title()                              : day1.getTitle())
                    .jobCategory(    request.jobCategory()    != null ? request.jobCategory()                        : day1.getJobCategory())
                    .jobSubcategory( request.jobSubcategory() != null ? request.jobSubcategory()                     : day1.getJobSubcategory())
                    .s3ContentUrl(finalS3ContentUrl)
                    .wage(           request.wage()           != null ? request.wage()                               : day1.getWage())
                    .wageType(       request.wageType()       != null ? WageType.valueOf(request.wageType())         : day1.getWageType())
                    .workDate(slice.date())
                    .workStart(slice.startTime())
                    .workEnd(slice.endTime())
                    .totalSlots(     request.totalSlots()     != null ? request.totalSlots()                         : day1.getTotalSlots())
                    .filledSlots(gp.getFilledSlots())   // 레코드별 독립 관리
                    .status(gp.getStatus())             // 상태는 레코드별 독립
                    .deadline(       request.deadline()       != null ? LocalDate.parse(request.deadline())         : day1.getDeadline())
                    .description(    request.description()    != null ? request.description()                        : day1.getDescription())
                    .requirements(   request.requirements()   != null ? request.requirements()                       : day1.getRequirements())
                    .benefits(       request.benefits()       != null ? request.benefits()                           : day1.getBenefits())
                    .tasks(          request.tasks()          != null ? request.tasks()                              : day1.getTasks())
                    .items(          request.items()          != null ? request.items()                              : day1.getItems())
                    .ageRequirements(request.ageRequirements() != null ? request.ageRequirements()                   : day1.getAgeRequirements())
                    .linkedGroupId(groupId)
                    .groupStartAt(finalGroupStartAt)
                    .groupEndAt(finalGroupEndAt)
                    .createdAt(gp.getCreatedAt())
                    .ageRequirements(request.ageRequirements() != null ? request.ageRequirements() : day1.getAgeRequirements())
                    .urgentEnabled(request.urgentEnabled() != null ? request.urgentEnabled() : day1.getUrgentEnabled())
                    .urgentWageIncrease(request.urgentWageIncrease() != null ? request.urgentWageIncrease() : day1.getUrgentWageIncrease())
                    .autoOfferEnabled(request.autoOfferEnabled() != null ? request.autoOfferEnabled() : day1.getAutoOfferEnabled())
                    .linkedGroupId(groupId)
                    .build()));
        }

        // Day1 레코드를 대표로 반환
        return JobPostDetailResponse.from(updatedPosts.get(0), false);
    }

    // ─── 마감 ────────────────────────────────────────────────────

    /**
     * 공고 마감 처리 — 소유권 검증 후 그룹 전체 CLOSED.
     * 자정 분할된 공고는 Day1·Day2 레코드 모두 함께 마감한다.
     */
    @Transactional
    public void closeJobPost(Long id, Long userId) {
        JobPost jobPost = jobPostRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("공고를 찾을 수 없습니다."));

        if (!jobPost.getWorkplace().getEmployer().getUser().getId().equals(userId)) {
            throw new IllegalStateException("본인의 공고만 마감 처리할 수 있습니다.");
        }

        // 그룹 전체 레코드를 함께 마감 (분할 공고 일관성)
        List<JobPost> groupPosts = jobPostRepository.findByLinkedGroupId(jobPost.getLinkedGroupId());
        for (JobPost gp : groupPosts) {
            gp.closeByEmployer();
            jobPostRepository.save(gp);
        }
    }

    // ─── 삭제 ────────────────────────────────────────────────────

    /**
     * 공고 삭제 — 소유권 검증, 본인 공고만, 그룹 전체 삭제.
     *
     * <p>자정 분할된 공고는 Day1·Day2 레코드와 각각에 연결된 Application 을 모두 삭제한다.
     * HIRED 지원자에게는 삭제 알림을 발송한다.
     */
    @Transactional
    public void deleteJobPost(Long jobPostId, Long userId) {
        JobPost jobPost = jobPostRepository.findById(jobPostId)
                .orElseThrow(() -> new NotFoundException("공고를 찾을 수 없습니다."));
        verifyJobPostOwnership(jobPost, userId);

        // 그룹 전체 레코드 조회
        List<JobPost> groupPosts = jobPostRepository.findByLinkedGroupId(jobPost.getLinkedGroupId());

        // HIRED 지원자 삭제 알림 (그룹 전체 레코드 대상)
        for (JobPost gp : groupPosts) {
            applicationRepository.findByJobPostId(gp.getId()).stream()
                    .filter(a -> a.getStatus() == ApplicationStatus.HIRED)
                    .forEach(a -> notificationService.notify(
                            a.getApplicantUser().getId(),
                            NotificationType.JOB_POST_DELETED,
                            "[" + gp.getTitle() + "] 공고가 고용주에 의해 삭제되었습니다.",
                            gp.getId()
                    ));
        }

        // 연관 Application 삭제 (그룹 전체, FK 제약 방지)
        for (JobPost gp : groupPosts) {
            List<Application> applications = applicationRepository.findByJobPostId(gp.getId());
            applicationRepository.deleteAll(applications);
        }

        // S3 이미지 삭제 (그룹 내 모든 레코드가 같은 URL 공유 → 대표 레코드 기준으로 1회만)
        s3Service.delete(jobPost.getS3ContentUrl());

        // 공고 삭제 (그룹 전체)
        jobPostRepository.deleteAll(groupPosts);
    }

    // ─── 기타 조회 ───────────────────────────────────────────────

    /** 제안 가능 공고 목록 조회 (OPEN + 해당 구직자와 연결된 공고 제외). */
    public CursorPageResponse<JobPostCardResponse> getOfferableJobPosts(
            Long userId, Long applicantUserId, Long cursor, int size) {
        int fetchSize = size + 1;
        List<JobPost> posts = jobPostRepository.findOfferableByEmployerIdWithCursor(
                userId, applicantUserId, cursor, PageRequest.of(0, fetchSize));

        boolean hasNext = posts.size() > size;
        if (hasNext) posts = posts.subList(0, size);

        List<JobPostCardResponse> content = posts.stream()
                .map(j -> JobPostCardResponse.from(j, false))
                .toList();

        Long nextCursor = hasNext ? content.get(content.size() - 1).id() : null;
        return CursorPageResponse.of(content, nextCursor, hasNext);
    }

    /** 좋아요한 공고 목록 조회 (구직자, 커서 페이지네이션). */
    public CursorPageResponse<JobPostCardResponse> getLikedJobPosts(Long userId, Long cursor, int size) {
        List<Long> likedIds = likeService.getLikedJobPostIds(userId);
        if (likedIds.isEmpty()) return CursorPageResponse.of(List.of(), null, false);

        int fetchSize = size + 1;
        List<JobPost> posts = jobPostRepository.findByIdInWithCursor(
                likedIds, cursor, PageRequest.of(0, fetchSize));

        boolean hasNext = posts.size() > size;
        if (hasNext) posts = posts.subList(0, size);

        List<JobPostCardResponse> content = posts.stream()
                .map(j -> JobPostCardResponse.from(j, true))
                .toList();

        Long nextCursor = hasNext ? content.get(content.size() - 1).id() : null;
        return CursorPageResponse.of(content, nextCursor, hasNext);
    }

    /** 우선 채용 대상자 목록 조회. */
    public List<OfferTargetResponse> getOfferTargets(Long jobPostId, Long employerUserId) {
        JobPost jobPost = jobPostRepository.findById(jobPostId)
                .orElseThrow(() -> new NotFoundException("공고를 찾을 수 없습니다."));

        List<Long> likedIds = jobPostLikeRepository.findByUserId(employerUserId)
                .stream().map(l -> l.getJobPost().getWorkplace().getEmployer().getUser().getId()).toList();
        List<Long> longTermIds = longTermWorkerRepository.findByEmployerUserId(employerUserId)
                .stream().map(l -> l.getApplicantUser().getId()).toList();

        List<Long> targetIds = java.util.stream.Stream.concat(likedIds.stream(), longTermIds.stream())
                .distinct().toList();

        List<Long> excludedByDate = applicationRepository
                .findByJobPost_WorkDateAndStatusIn(
                        jobPost.getWorkDate(),
                        List.of(ApplicationStatus.HIRED, ApplicationStatus.PENDING))
                .stream().map(a -> a.getApplicantUser().getId()).toList();

        List<Long> excludedByDuplicate = applicationRepository
                .findByJobPostId(jobPostId)
                .stream().map(a -> a.getApplicantUser().getId()).toList();

        return targetIds.stream()
                .filter(id -> !excludedByDate.contains(id))
                .filter(id -> !excludedByDuplicate.contains(id))
                .map(userId -> {
                    User applicant = userRepository.findById(userId).orElse(null);
                    if (applicant == null) return null;
                    return new OfferTargetResponse(
                            userId,
                            applicant.getName(),
                            likedIds.contains(userId),
                            longTermIds.contains(userId),
                            false
                    );
                })
                .filter(t -> t != null)
                .toList();
    }

    // ─── private helpers ─────────────────────────────────────────

    /**
     * 자정 분할을 처리하여 1~2개의 JobPost 를 생성 후 저장한다.
     *
     * <p>workEnd &lt;= workStart 이면 자정 넘김으로 판단하고 다음날 종료로 계산한다.
     * {@link TimeSlotSplitter#split} 에 위임하며, Slice 별로 동일한 공통 필드를 공유하는
     * JobPost 를 빌드한다.
     *
     * @return 저장된 JobPost 목록 (Day1 이 index 0)
     */
    private List<JobPost> splitAndSaveJobPosts(
            JobPostCreateRequest request, Workplace workplace, String contentUrl) {

        LocalDate workDate  = LocalDate.parse(request.getWorkDate());
        LocalTime workStart = LocalTime.parse(request.getWorkStart());
        LocalTime workEnd   = LocalTime.parse(request.getWorkEnd());

        LocalDateTime startAt = LocalDateTime.of(workDate, workStart);
        // workEnd <= workStart 이면 자정 넘김 — endAt 을 다음날로 계산
        LocalDateTime endAt = workEnd.compareTo(workStart) <= 0
                ? LocalDateTime.of(workDate.plusDays(1), workEnd)
                : LocalDateTime.of(workDate, workEnd);

        TimeSlotSplitter.Split split = TimeSlotSplitter.split(startAt, endAt);

        List<JobPost> savedPosts = new ArrayList<>();
        for (TimeSlotSplitter.Slice slice : split.slices()) {
            JobPost post = buildJobPostFromSlice(request, workplace, contentUrl, split, slice);
            savedPosts.add(jobPostRepository.save(post));
        }
        return savedPosts;
    }

    /**
     * 단일 Slice 와 공통 필드를 조합해 JobPost 엔티티를 빌드한다.
     * {@code filledSlots} 는 0 으로 초기화된다.
     */
    private JobPost buildJobPostFromSlice(
            JobPostCreateRequest request,
            Workplace workplace,
            String contentUrl,
            TimeSlotSplitter.Split split,
            TimeSlotSplitter.Slice slice) {

        return JobPost.builder()
                .workplace(workplace)
                .title(request.getTitle())
                .jobCategory(request.getJobCategory() != null ? request.getJobCategory() : "미분류")
                .jobSubcategory(request.getJobSubcategory())
                .s3ContentUrl(contentUrl)
                .wage(request.getWage())
                .wageType(WageType.valueOf(request.getWageType()))
                // Slice 별 날짜·시간 (자정 분할 시 Day1=MAX, Day2=MIN 으로 채워짐)
                .workDate(slice.date())
                .workStart(slice.startTime())
                .workEnd(slice.endTime())
                .totalSlots(request.getTotalSlots())
                .status(JobPostStatus.OPEN)
                .deadline(LocalDate.parse(request.getDeadline()))
                .description(request.getDescription())
                .requirements(request.getRequirements())
                .benefits(request.getBenefits())
                .tasks(request.getTasks())
                .items(request.getItems())
                // 그룹 컬럼 — 분할된 두 레코드가 동일한 값을 공유
                .linkedGroupId(split.linkedGroupId())
                .groupStartAt(split.groupStartAt())
                .groupEndAt(split.groupEndAt())
                .groupEndAt(split.groupEndAt())
                .urgentEnabled(request.getUrgentEnabled())
                .urgentWageIncrease(request.getUrgentWageIncrease())
                .autoOfferEnabled(request.getAutoOfferEnabled())
                .build();
    }

    // 오퍼 대상자 ID 목록 추출 (날짜 겹침 + 중복 지원 제외)
    private List<Long> getOfferTargetIds(JobPost jobPost, Long employerUserId) {
        List<Long> likedIds = jobPostLikeRepository.findByUserId(employerUserId)
                .stream().map(l -> l.getJobPost().getWorkplace().getEmployer().getUser().getId()).toList();
        List<Long> longTermIds = longTermWorkerRepository.findByEmployerUserId(employerUserId)
                .stream().map(l -> l.getApplicantUser().getId()).toList();

        List<Long> excludedByDate = applicationRepository
                .findByJobPost_WorkDateAndStatusIn(
                        jobPost.getWorkDate(),
                        List.of(ApplicationStatus.HIRED, ApplicationStatus.PENDING))
                .stream().map(a -> a.getApplicantUser().getId()).toList();

        List<Long> excludedByDuplicate = applicationRepository
                .findByJobPostId(jobPost.getId())
                .stream().map(a -> a.getApplicantUser().getId()).toList();

        return java.util.stream.Stream.concat(likedIds.stream(), longTermIds.stream())
                .distinct()
                .filter(id -> !excludedByDate.contains(id))
                .filter(id -> !excludedByDuplicate.contains(id))
                .toList();
    }

    /** 공고 소유권 검증 — 본인 사업장의 공고가 아니면 {@link IllegalStateException}. */
    private void verifyJobPostOwnership(JobPost jobPost, Long userId) {
        if (!jobPost.getWorkplace().getEmployer().getUser().getId().equals(userId)) {
            throw new IllegalStateException("본인의 공고만 수정/삭제할 수 있습니다.");
        }
    }

    /** 응답에 포함된 공고들을 ImpressionBatchEvent 로 묶어 발행. 비어 있으면 발행하지 않음. */
    private void publishImpressionEvent(
            CursorPageResponse<JobPostCardResponse> response,
            String sortType,
            User user,
            String requestId) {
        if (response == null || response.contents() == null || response.contents().isEmpty()) return;

        List<InteractionEvents.Impression> impressions = new ArrayList<>(response.contents().size());
        for (int i = 0; i < response.contents().size(); i++) {
            impressions.add(new InteractionEvents.Impression(
                    response.contents().get(i).id(),
                    i + 1   // 1-based position
            ));
        }
        eventPublisher.publishEvent(new InteractionEvents.ImpressionBatchEvent(
                requestId,
                user != null ? user.getId() : null,
                sortType,
                impressions,
                LocalDateTime.now()
        ));
    }
}
