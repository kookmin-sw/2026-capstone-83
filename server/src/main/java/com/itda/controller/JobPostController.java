package com.itda.controller;

import com.itda.dto.request.JobPostFilterRequest;
import com.itda.dto.request.JobPostCreateRequest;
import com.itda.dto.response.CursorPageResponse;
import com.itda.dto.response.JobPostCardResponse;
import com.itda.dto.response.JobPostDetailResponse;
import com.itda.entity.JobPost;
import com.itda.entity.Workplace;
import com.itda.repository.WorkplaceRepository;
import com.itda.service.JobPostService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
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
    public ResponseEntity<JobPostDetailResponse> getJobPost(@PathVariable Long id) {
        return ResponseEntity.ok(jobPostService.getJobPost(id));
    }
    /**
     * 고용주 본인 공고 목록 조회 (커서 페이지네이션)
     * GET /api/v1/job-posts/employer/{employerId}?cursor=&size=
     */
    @GetMapping("/employer/{employerId}")
    public ResponseEntity<CursorPageResponse<JobPostCardResponse>> getJobPostsByEmployer(
            @PathVariable Long employerId,
            @RequestParam(required = false) Long cursor,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(jobPostService.getJobPostsByEmployer(employerId, cursor, size));
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
    public ResponseEntity<JobPostDetailResponse> createJobPost(
            @RequestBody JobPostCreateRequest request) {
        Workplace workplace = workplaceRepository.findById(request.workplaceId())
                .orElseThrow(() -> new RuntimeException("사업장을 찾을 수 없습니다."));
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(jobPostService.createJobPost(request, workplace));
    }

    /**
     * 공고 수정
     * PUT /api/v1/job-posts/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<JobPostDetailResponse> updateJobPost(
            @PathVariable Long id,
            @RequestBody JobPostCreateRequest request) {
        return ResponseEntity.ok(jobPostService.updateJobPost(id, request));
    }

    /**
     * 공고 삭제
     * DELETE /api/v1/job-posts/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteJobPost(@PathVariable Long id) {
        jobPostService.deleteJobPost(id);
        return ResponseEntity.ok().build();
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