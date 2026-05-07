package com.itda.service;

import com.itda.dto.request.JobPostFilterRequest;
import com.itda.dto.response.CursorPageResponse;
import com.itda.dto.response.JobPostCardResponse;
import com.itda.entity.Workplace;
import com.itda.entity.JobPost;
import com.itda.enums.JobPostStatus;
import com.itda.enums.WageType;
import com.itda.exception.NotFoundException;
import com.itda.repository.JobPostRepository;
import com.itda.dto.request.JobPostCreateRequest;
import com.itda.dto.response.JobPostDetailResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class JobPostService {

    private final JobPostRepository jobPostRepository;

    /**
     * 공고 목록 통합 조회 (필터 + 커서 페이지네이션)
     * 지원자/고용주 공통 사용 - 모든 필터를 JobPostFilterRequest 하나로 처리
     */
    public CursorPageResponse<JobPostCardResponse> getJobPosts(JobPostFilterRequest filter) {
        // size + 1개 조회해서 다음 페이지 존재 여부 확인
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

        // 다음 페이지 존재 여부 확인
        boolean hasNext = posts.size() > filter.getSize();
        if (hasNext) {
            posts = posts.subList(0, filter.getSize());
        }

        // Entity -> DTO 변환
        List<JobPostCardResponse> jobPosts = posts.stream()
                .map(JobPostCardResponse::from)
                .toList();

        Long nextCursor = hasNext ? jobPosts.get(jobPosts.size() - 1).id() : null;

        return CursorPageResponse.of(jobPosts, nextCursor, hasNext);
    }

    /**
     * 공고 상세 조회
     * 공고 카드 클릭 시 상세 페이지에서 사용
     */
    public JobPostDetailResponse getJobPost(Long id) {
        JobPost post = jobPostRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("공고를 찾을 수 없습니다."));
        return JobPostDetailResponse.from(post);
    }
    /**
     * 고용주 본인 공고 목록 조회 (커서 페이지네이션)
     */
    public CursorPageResponse<JobPostCardResponse> getJobPostsByEmployer(Long employerId, Long cursor, int size) {
        int fetchSize = size + 1;
        List<JobPost> posts = jobPostRepository.findByEmployerIdWithCursor(
                employerId, cursor, PageRequest.of(0, fetchSize));

        boolean hasNext = posts.size() > size;
        if (hasNext) {
            posts = posts.subList(0, size);
        }

        List<JobPostCardResponse> content = posts.stream()
                .map(JobPostCardResponse::from)
                .toList();

        Long nextCursor = hasNext ? content.get(content.size() - 1).id() : null;
        return CursorPageResponse.of(content, nextCursor, hasNext);
    }

    /**
     * 캘린더용 날짜 범위 공고 조회
     */
    public List<JobPost> getJobPostsByDateRange(Long employerId, LocalDate start, LocalDate end) {
        return jobPostRepository.findByEmployerIdAndWorkDateBetween(employerId, start, end);
    }

    /**
     * 공고 등록
     * 이미지 파일은 추후 S3 연동 시 업로드 처리 예정
     * 현재는 이미지 URL 없이 저장
     */
    @Transactional
    public JobPostDetailResponse createJobPost(
            JobPostCreateRequest request,
            Workplace workplace,
            MultipartFile companyLogoImage,
            MultipartFile descriptionImage) {
        // TODO: S3 업로드 연동 시 이미지 URL 처리 추가
        JobPost saved = jobPostRepository.save(request.toEntity(workplace));
        return JobPostDetailResponse.from(saved);
    }

    /**
     * 공고 수정
     * 기존 공고를 찾아서 새 데이터로 덮어쓰기
     */
    @Transactional
    public JobPostDetailResponse updateJobPost(Long id, JobPostCreateRequest request) {
        JobPost existing = jobPostRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("공고를 찾을 수 없습니다."));

        JobPost updated = JobPost.builder()
                .id(existing.getId())
                .workplace(existing.getWorkplace())
                .title(request.getTitle())
                .jobCategory(request.getJobCategory())
                .jobSubcategory(request.getJobSubcategory())
                .wage(request.getWage())
                .wageType(WageType.valueOf(request.getWageType()))
                .workDate(LocalDate.parse(request.getWorkDate()))
                .workStart(LocalTime.parse(request.getWorkStart()))
                .workEnd(LocalTime.parse(request.getWorkEnd()))
                .totalSlots(request.getTotalSlots())
                .filledSlots(existing.getFilledSlots())
                .status(existing.getStatus())
                .deadline(LocalDate.parse(request.getDeadline()))
                .description(request.getDescription())
                .s3ContentUrl(request.getS3ContentUrl())
                .requirements(request.getRequirements())
                .benefits(request.getBenefits())
                .tasks(request.getTasks())
                .items(request.getItems())
                .build();

        return JobPostDetailResponse.from(jobPostRepository.save(updated));
    }

    /**
     * 공고 삭제
     */
    @Transactional
    public void deleteJobPost(Long id) {
        JobPost jobPost = jobPostRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("공고를 찾을 수 없습니다."));
        jobPostRepository.delete(jobPost);
    }

    /**
     * 공고 마감 처리
     */
    @Transactional
    public void closeJobPost(Long id) {
        JobPost jobPost = jobPostRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("공고를 찾을 수 없습니다."));
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
                .status(JobPostStatus.CLOSED)
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