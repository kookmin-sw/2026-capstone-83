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
import com.itda.service.event.InteractionEvents;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
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

    // 공고 목록 통합 조회 (필터 + 커서 페이지네이션)
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
            if (hasNext) {
                posts = posts.subList(0, filter.getSize());
            }

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

    // 공고 상세 조회 — liked 포함
    // requestId, referrerSortType : 클라이언트가 X-Request-Id / X-Referrer-Sort-Type 헤더로 전달
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

    // 응답에 포함된 공고들을 ImpressionBatchEvent 로 묶어 발행
    private void publishImpressionEvent(
            CursorPageResponse<JobPostCardResponse> response,
            String sortType,
            User user,
            String requestId) {
        if (response == null || response.contents() == null || response.contents().isEmpty()) {
            return;
        }
        List<InteractionEvents.Impression> impressions = new ArrayList<>(response.contents().size());
        for (int i = 0; i < response.contents().size(); i++) {
            impressions.add(new InteractionEvents.Impression(
                    response.contents().get(i).id(),
                    i + 1
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

    // 고용주 본인 공고 목록 조회 (커서 페이지네이션, status 필터 선택적)
    public CursorPageResponse<JobPostCardResponse> getJobPostsByEmployer(Long userId, Long cursor, int size, String status) {
        int fetchSize = size + 1;

        JobPostStatus statusEnum = (status != null) ? JobPostStatus.valueOf(status) : null;

        List<JobPost> posts = (statusEnum != null)
                ? jobPostRepository.findByEmployerIdAndStatusWithCursor(userId, statusEnum, cursor, PageRequest.of(0, fetchSize))
                : jobPostRepository.findByEmployerIdWithCursor(userId, cursor, PageRequest.of(0, fetchSize));

        boolean hasNext = posts.size() > size;
        if (hasNext) {
            posts = posts.subList(0, size);
        }

        List<JobPostCardResponse> content = posts.stream()
                .map(j -> JobPostCardResponse.from(j, false))
                .toList();

        Long nextCursor = hasNext ? content.get(content.size() - 1).id() : null;
        return CursorPageResponse.of(content, nextCursor, hasNext);
    }

    // 캘린더용 날짜 범위 공고 조회
    public List<JobPost> getJobPostsByDateRange(Long userId, LocalDate start, LocalDate end) {
        return jobPostRepository.findByEmployerIdAndWorkDateBetween(userId, start, end);
    }

    // 공고 등록 - 이미지 파일 S3 업로드 후 URL 저장
    @Transactional
    public JobPostDetailResponse createJobPost(
            JobPostCreateRequest request,
            Workplace workplace,
            MultipartFile companyLogoImage,
            MultipartFile descriptionImage) {

        // 회사 로고 이미지가 있으면 S3 업로드 후 Workplace에 URL 저장
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

        JobPost saved = jobPostRepository.save(request.toEntity(workplace, contentUrl));

        // 자동 오퍼 처리 (autoOfferEnabled=true인 경우)
        if (request.isAutoOfferEnabled()) {
            List<Long> targetIds = getOfferTargetIds(saved, workplace.getEmployer().getUser().getId());
            if (!targetIds.isEmpty()) {
                applicationService.bulkOffer(saved.getId(),
                        new BulkOfferRequest(targetIds),
                        workplace.getEmployer().getUser());
            }
        }

        return JobPostDetailResponse.from(saved, false);
    }

    // 공고 수정 (부분 수정 — null 필드는 기존 값 유지, 본인 공고만)
    @Transactional
    public JobPostDetailResponse updateJobPost(Long jobPostId, JobPostUpdateRequest request,
                                               MultipartFile descriptionImage, Long userId) {
        JobPost jobPost = jobPostRepository.findById(jobPostId)
                .orElseThrow(() -> new NotFoundException("공고를 찾을 수 없습니다."));

        verifyJobPostOwnership(jobPost, userId);

        String s3ContentUrl = jobPost.getS3ContentUrl();
        if (descriptionImage != null && !descriptionImage.isEmpty()) {
            s3Service.delete(s3ContentUrl);
            s3ContentUrl = s3Service.upload(descriptionImage, S3Service.PATH_JOB_POSTS);
        }

        JobPost updated = jobPostRepository.save(JobPost.builder()
                .id(jobPost.getId())
                .workplace(jobPost.getWorkplace())
                .title(request.title() != null ? request.title() : jobPost.getTitle())
                .jobCategory(request.jobCategory() != null ? request.jobCategory() : jobPost.getJobCategory())
                .jobSubcategory(request.jobSubcategory() != null ? request.jobSubcategory() : jobPost.getJobSubcategory())
                .s3ContentUrl(s3ContentUrl)
                .wage(request.wage() != null ? request.wage() : jobPost.getWage())
                .wageType(request.wageType() != null ? WageType.valueOf(request.wageType()) : jobPost.getWageType())
                .workDate(request.workDate() != null ? java.time.LocalDate.parse(request.workDate()) : jobPost.getWorkDate())
                .workStart(request.workStart() != null ? java.time.LocalTime.parse(request.workStart()) : jobPost.getWorkStart())
                .workEnd(request.workEnd() != null ? java.time.LocalTime.parse(request.workEnd()) : jobPost.getWorkEnd())
                .totalSlots(request.totalSlots() != null ? request.totalSlots() : jobPost.getTotalSlots())
                .filledSlots(jobPost.getFilledSlots())
                .status(jobPost.getStatus())
                .deadline(request.deadline() != null ? java.time.LocalDate.parse(request.deadline()) : jobPost.getDeadline())
                .description(request.description() != null ? request.description() : jobPost.getDescription())
                .requirements(request.requirements() != null ? request.requirements() : jobPost.getRequirements())
                .benefits(request.benefits() != null ? request.benefits() : jobPost.getBenefits())
                .tasks(request.tasks() != null ? request.tasks() : jobPost.getTasks())
                .items(request.items() != null ? request.items() : jobPost.getItems())
                .ageRequirements(request.ageRequirements() != null ? request.ageRequirements() : jobPost.getAgeRequirements())
                .urgentEnabled(jobPost.isUrgentEnabled())
                .urgentWageIncrease(jobPost.getUrgentWageIncrease())
                .autoOfferEnabled(jobPost.isAutoOfferEnabled())
                .createdAt(jobPost.getCreatedAt())
                .build());

        return JobPostDetailResponse.from(updated, false);
    }

    // 공고 삭제 (본인 공고만)
    @Transactional
    public void deleteJobPost(Long jobPostId, Long userId) {
        JobPost jobPost = jobPostRepository.findById(jobPostId)
                .orElseThrow(() -> new NotFoundException("공고를 찾을 수 없습니다."));

        verifyJobPostOwnership(jobPost, userId);

        applicationRepository.findByJobPostId(jobPostId).stream()
                .filter(a -> a.getStatus() == ApplicationStatus.HIRED)
                .forEach(a -> notificationService.notify(
                        a.getApplicantUser().getId(),
                        NotificationType.JOB_POST_DELETED,
                        "[" + jobPost.getTitle() + "] 공고가 고용주에 의해 삭제되었습니다.",
                        jobPostId
                ));

        List<Application> applications = applicationRepository.findByJobPostId(jobPostId);
        applicationRepository.deleteAll(applications);

        s3Service.delete(jobPost.getS3ContentUrl());
        jobPostRepository.delete(jobPost);
    }

    // 공고 마감 처리 - 소유권 검증
    @Transactional
    public void closeJobPost(Long id, Long userId) {
        JobPost jobPost = jobPostRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("공고를 찾을 수 없습니다."));

        if (!jobPost.getWorkplace().getEmployer().getUser().getId().equals(userId)) {
            throw new IllegalStateException("본인의 공고만 마감 처리할 수 있습니다.");
        }

        jobPost.closeByEmployer();
        jobPostRepository.save(jobPost);
    }

    // 제안 가능 공고 목록 조회 (OPEN + 해당 구직자와 연결된 공고 제외)
    public CursorPageResponse<JobPostCardResponse> getOfferableJobPosts(Long userId, Long applicantUserId, Long cursor, int size) {
        int fetchSize = size + 1;
        List<JobPost> posts = jobPostRepository.findOfferableByEmployerIdWithCursor(
                userId, applicantUserId, cursor, PageRequest.of(0, fetchSize));

        boolean hasNext = posts.size() > size;
        if (hasNext) {
            posts = posts.subList(0, size);
        }

        List<JobPostCardResponse> content = posts.stream()
                .map(j -> JobPostCardResponse.from(j, false))
                .toList();

        Long nextCursor = hasNext ? content.get(content.size() - 1).id() : null;
        return CursorPageResponse.of(content, nextCursor, hasNext);
    }

    // 좋아요한 공고 목록 조회 (구직자, 커서 페이지네이션)
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

    // 우선 채용 대상자 목록 조회
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

    // ─── 내부 헬퍼 ───────────────────────────────────────────

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

    // 공고 소유권 검증
    private void verifyJobPostOwnership(JobPost jobPost, Long userId) {
        if (!jobPost.getWorkplace().getEmployer().getUser().getId().equals(userId)) {
            throw new IllegalStateException("본인의 공고만 수정/삭제할 수 있습니다.");
        }
    }
}