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
import com.itda.exception.NotFoundException;
import com.itda.repository.JobPostLikeRepository;
import com.itda.repository.JobPostRepository;
import com.itda.repository.WorkplaceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import java.time.LocalDate;
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

    // 공고 목록 통합 조회 (필터 + 커서 페이지네이션)
    // 지원자/고용주 공통 사용 - 모든 필터를 JobPostFilterRequest 하나로 처리
    public CursorPageResponse<JobPostCardResponse> getJobPosts(JobPostFilterRequest filter, User user) {
        int fetchSize = filter.getSize() + 1;

        List<JobPost> posts = jobPostRepository.findByFilter(
                filter.cursor(),
                filter.keyword(),
                filter.jobCategory(),
                filter.jobSubcategory(),
                filter.location(),
                filter.workDate(),
                filter.sortType(),
                PageRequest.of(0, fetchSize)
        );

        boolean hasNext = posts.size() > filter.getSize();
        if (hasNext) {
            posts = posts.subList(0, filter.getSize());
        }

        // liked 공고 ID 목록
        List<Long> likedIds = (user != null)
                ? likeService.getLikedJobPostIds(user.getId())
                : List.of();

        // liked 상단 정렬 후 DTO 변환
        List<JobPostCardResponse> jobPosts = posts.stream()
                .map(j -> JobPostCardResponse.from(j, likedIds.contains(j.getId())))
                .toList();

        Long nextCursor = hasNext ? jobPosts.get(jobPosts.size() - 1).id() : null;

        return CursorPageResponse.of(jobPosts, nextCursor, hasNext);
    }

    // 공고 상세 조회
    public JobPostDetailResponse getJobPost(Long id) {
        JobPost post = jobPostRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("공고를 찾을 수 없습니다."));
        return JobPostDetailResponse.from(post);
    }

    // 고용주 본인 공고 목록 조회
    public List<JobPost> getJobPostsByEmployer(Long userId) {
        return jobPostRepository.findByEmployerId(userId);
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
            String logoUrl = s3Service.upload(companyLogoImage, "logos");
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
        return JobPostDetailResponse.from(saved);
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