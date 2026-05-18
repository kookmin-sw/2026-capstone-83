package com.itda.service;

import com.itda.dto.request.JobPostCreateRequest;
import com.itda.dto.request.JobPostFilterRequest;
import com.itda.dto.response.CursorPageResponse;
import com.itda.dto.response.JobPostCardResponse;
import com.itda.dto.response.JobPostDetailResponse;
import com.itda.entity.JobPost;
import com.itda.entity.User;
import com.itda.entity.Workplace;
import com.itda.enums.JobPostStatus;
import com.itda.enums.UserRole;
import com.itda.exception.NotFoundException;
import com.itda.repository.JobPostLikeRepository;
import com.itda.repository.JobPostRepository;
import com.itda.repository.WorkplaceRepository;
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
    private final JobPostLikeRepository jobPostLikeRepository;
    private final LikeService likeService;
    private final S3Service s3Service;                   // S3 업로드 서비스 주입
    private final WorkplaceRepository workplaceRepository; // 로고 URL 저장용
    private final JobPostRankingService rankingService;    // 개인화 추천
    private final ApplicationEventPublisher eventPublisher; // impression/click 이벤트 발행

    // 공고 목록 통합 조회 (필터 + 커서 페이지네이션)
    // 지원자/고용주 공통 사용 - 모든 필터(다중 태그/범위 포함)를 JobPostRepositoryCustom으로 위임
    // requestId: 컨트롤러에서 생성한 UUID. 노출 로그를 한 응답으로 묶기 위한 식별자.
    public CursorPageResponse<JobPostCardResponse> getJobPosts(
            JobPostFilterRequest filter, User user, String requestId) {

        CursorPageResponse<JobPostCardResponse> response;

        if ("RECOMMENDED".equalsIgnoreCase(filter.sortType())
                && user != null
                && user.getRole() == UserRole.APPLICANT) {
            // 추천 정렬: APPLICANT 로그인 사용자만 개인화 랭킹. 태그 필터는 무시.
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

        // 로그인 유저면 좋아요 여부 확인
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

    // 응답에 포함된 공고들을 ImpressionBatchEvent 로 묶어 발행.
    // 비어 있으면 발행하지 않음.
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
                    i + 1                       // 1-based position
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

    // 고용주 본인 공고 목록 조회 (커서 페이지네이션)
    public CursorPageResponse<JobPostCardResponse> getJobPostsByEmployer(Long userId, Long cursor, int size) {
        int fetchSize = size + 1;
        List<JobPost> posts = jobPostRepository.findByEmployerIdWithCursor(
                userId, cursor, PageRequest.of(0, fetchSize));

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

        // 공고 상세 이미지가 있으면 S3 업로드 후 URL 추출, 없으면 null
        String contentUrl = null;
        if (descriptionImage != null && !descriptionImage.isEmpty()) {
            contentUrl = s3Service.upload(descriptionImage, "job-posts");
        }

        // contentUrl을 받는 오버로드 toEntity 사용
        JobPost saved = jobPostRepository.save(request.toEntity(workplace, contentUrl));
        return JobPostDetailResponse.from(saved, false);
    }

    // 공고 마감 처리 - 소유권 검증
    @Transactional
    public void closeJobPost(Long id, Long userId) {
        JobPost jobPost = jobPostRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("공고를 찾을 수 없습니다."));

        if (!jobPost.getWorkplace().getEmployer().getUser().getId().equals(userId)) {
            throw new IllegalStateException("본인의 공고만 마감 처리할 수 있습니다.");
        }

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
                .filledSlots(jobPost.getFilledSlots())
                .status(JobPostStatus.CLOSED) // 상태를 CLOSED로 변경
                .deadline(jobPost.getDeadline())
                .jobCategory(jobPost.getJobCategory())
                .jobSubcategory(jobPost.getJobSubcategory())
                .description(jobPost.getDescription())
                .requirements(jobPost.getRequirements())
                .benefits(jobPost.getBenefits())
                .tasks(jobPost.getTasks())
                .items(jobPost.getItems())
                .build());
    }
}