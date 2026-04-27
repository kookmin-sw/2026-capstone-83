package com.itda.controller;

import com.itda.dto.request.JobPostFilterRequest;
import com.itda.dto.response.CursorPageResponse;
import com.itda.dto.response.JobPostCardResponse;
import com.itda.entity.JobPost;
import com.itda.entity.Workplace;
import com.itda.repository.WorkplaceRepository;
import com.itda.service.JobPostService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/job-posts")
@RequiredArgsConstructor
public class JobPostController {

    private final JobPostService jobPostService;
    private final WorkplaceRepository workplaceRepository;

    /**
     * 공고 목록 통합 조회 (필터 + 커서 페이지네이션)
     * 지원자/고용주 공통 사용 - 버튼은 프론트에서 role 기준으로 처리
     * GET /api/v1/job-posts?cursor=&size=&keyword=&jobCategory=&location=&sortType=
     */
    @GetMapping
    public ResponseEntity<CursorPageResponse<JobPostCardResponse>> getJobPosts(
            @ModelAttribute JobPostFilterRequest filter) {
        return ResponseEntity.ok(jobPostService.getJobPosts(filter));
    }

    /**
     * 공고 상세 조회
     * GET /api/v1/job-posts/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<JobPost> getJobPost(@PathVariable Long id) {
        return ResponseEntity.ok(jobPostService.getJobPost(id));
    }

    /**
     * 고용주 본인 공고 목록 조회
     * GET /api/v1/job-posts/employer/{employerId}
     */
    @GetMapping("/employer/{employerId}")
    public ResponseEntity<List<JobPost>> getJobPostsByEmployer(@PathVariable Long employerId) {
        return ResponseEntity.ok(jobPostService.getJobPostsByEmployer(employerId));
    }

    /**
     * 캘린더용 날짜 범위 공고 조회
     * GET /api/v1/job-posts/employer/{employerId}/calendar?start=&end=
     */
    @GetMapping("/employer/{employerId}/calendar")
    public ResponseEntity<List<JobPost>> getJobPostsByDateRange(
            @PathVariable Long employerId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end) {
        return ResponseEntity.ok(jobPostService.getJobPostsByDateRange(employerId, start, end));
    }

    /**
     * 공고 등록
     * POST /api/v1/job-posts
     */
    @PostMapping
    public ResponseEntity<JobPost> createJobPost(
            @RequestParam Long workplaceId,
            @RequestBody JobPost jobPost) {
        Workplace workplace = workplaceRepository.findById(workplaceId)
                .orElseThrow(() -> new RuntimeException("사업장을 찾을 수 없습니다."));
        JobPost newJobPost = JobPost.builder()
                .workplace(workplace)
                .title(jobPost.getTitle())
                .jobCategory(jobPost.getJobCategory())
                .jobSubcategory(jobPost.getJobSubcategory())
                .s3ContentUrl(jobPost.getS3ContentUrl())
                .wage(jobPost.getWage())
                .wageType(jobPost.getWageType())
                .workDate(jobPost.getWorkDate())
                .workStart(jobPost.getWorkStart())
                .workEnd(jobPost.getWorkEnd())
                .totalSlots(jobPost.getTotalSlots())
                .status(jobPost.getStatus())
                .deadline(jobPost.getDeadline())
                .description(jobPost.getDescription())
                .requirements(jobPost.getRequirements())
                .benefits(jobPost.getBenefits())
                .tasks(jobPost.getTasks())
                .items(jobPost.getItems())
                .build();
        return ResponseEntity.ok(jobPostService.createJobPost(newJobPost));
    }

    /**
     * 공고 마감 처리
     * PATCH /api/v1/job-posts/{id}/close
     */
    @PatchMapping("/{id}/close")
    public ResponseEntity<Void> closeJobPost(@PathVariable Long id) {
        jobPostService.closeJobPost(id);
        return ResponseEntity.ok().build();
    }
}