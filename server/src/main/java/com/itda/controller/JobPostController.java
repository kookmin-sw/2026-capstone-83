package com.itda.controller;

import com.itda.dto.request.JobPostFilterRequest;
import com.itda.dto.request.JobPostCreateRequest;
import com.itda.dto.request.JobPostUpdateRequest;
import com.itda.dto.response.CursorPageResponse;
import com.itda.dto.response.JobPostCardResponse;
import com.itda.dto.response.JobPostDetailResponse;
import com.itda.dto.response.OfferTargetResponse;
import com.itda.entity.JobPost;
import com.itda.entity.User;
import com.itda.entity.Workplace;
import com.itda.service.JobPostService;
import com.itda.service.WorkplaceService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/job-posts")
@RequiredArgsConstructor
public class JobPostController {

    private final JobPostService jobPostService;
    private final WorkplaceService workplaceService;

    /**
     * 공고 목록 통합 조회 (필터 + 커서 페이지네이션)
     * GET /api/v1/job-posts?cursor=&size=&keyword=&jobCategory=&sortType=
     */
    @GetMapping
    public ResponseEntity<CursorPageResponse<JobPostCardResponse>> getJobPosts(
            @ModelAttribute JobPostFilterRequest filter,
            @AuthenticationPrincipal User user) {
        String requestId = UUID.randomUUID().toString();
        return ResponseEntity.ok(jobPostService.getJobPosts(filter, user, requestId));
    }

    /**
     * 공고 상세 조회
     * GET /api/v1/job-posts/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<JobPostDetailResponse> getJobPost(
            @PathVariable Long id,
            @AuthenticationPrincipal User user,
            @RequestParam(required = false) String referrerSortType) {
        String requestId = UUID.randomUUID().toString();
        return ResponseEntity.ok(jobPostService.getJobPost(id, user, requestId, referrerSortType));
    }

    /**
     * 고용주 본인 공고 목록 조회 (커서 페이지네이션)
     * GET /api/v1/job-posts/employer?cursor=&size=&status=
     */
    @GetMapping("/employer")
    public ResponseEntity<CursorPageResponse<JobPostCardResponse>> getJobPostsByEmployer(
            @AuthenticationPrincipal User user,
            @RequestParam(required = false) Long cursor,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String status) {
        return ResponseEntity.ok(jobPostService.getJobPostsByEmployer(user.getId(), cursor, size, status));
    }

    /**
     * 좋아요한 공고 목록 조회 (구직자)
     * GET /api/v1/job-posts/liked?cursor=&size=
     */
    @GetMapping("/liked")
    public ResponseEntity<CursorPageResponse<JobPostCardResponse>> getLikedJobPosts(
            @AuthenticationPrincipal User user,
            @RequestParam(required = false) Long cursor,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(jobPostService.getLikedJobPosts(user.getId(), cursor, size));
    }

    /**
     * 캘린더용 날짜 범위 공고 조회
     * GET /api/v1/job-posts/employer/calendar?start=&end=
     */
    @GetMapping("/employer/calendar")
    public ResponseEntity<List<JobPost>> getJobPostsByDateRange(
            @AuthenticationPrincipal User user,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end) {
        return ResponseEntity.ok(jobPostService.getJobPostsByDateRange(user.getId(), start, end));
    }

    /**
     * 제안 가능 공고 목록 조회 (OPEN + 해당 구직자와 미연결)
     * GET /api/v1/job-posts/employer/offerable?applicantUserId=&cursor=&size=
     */
    @GetMapping("/employer/offerable")
    public ResponseEntity<CursorPageResponse<JobPostCardResponse>> getOfferableJobPosts(
            @AuthenticationPrincipal User user,
            @RequestParam Long applicantUserId,
            @RequestParam(required = false) Long cursor,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(jobPostService.getOfferableJobPosts(user.getId(), applicantUserId, cursor, size));
    }

    /**
     * 우선 채용 대상자 목록 조회
     * GET /api/v1/job-posts/{id}/offer-targets
     */
    @GetMapping("/{id}/offer-targets")
    public ResponseEntity<List<OfferTargetResponse>> getOfferTargets(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(jobPostService.getOfferTargets(id, user.getId()));
    }

    /**
     * 공고 등록
     * POST /api/v1/job-posts?workplaceId=
     */
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<JobPostDetailResponse> createJobPost(
            @AuthenticationPrincipal User user,
            @RequestParam Long workplaceId,
            @ModelAttribute JobPostCreateRequest request,
            @RequestPart(value = "companyLogoImage", required = false) MultipartFile companyLogoImage,
            @RequestPart(value = "descriptionImage", required = false) MultipartFile descriptionImage) {
        Workplace workplace = workplaceService.getOwnedWorkplace(user, workplaceId);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(jobPostService.createJobPost(request, workplace, companyLogoImage, descriptionImage));
    }

    /**
     * 공고 수정 (부분 수정)
     * PUT /api/v1/job-posts/{id}
     */
    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<JobPostDetailResponse> updateJobPost(
            @PathVariable Long id,
            @AuthenticationPrincipal User user,
            @RequestPart("data") JobPostUpdateRequest request,
            @RequestPart(value = "descriptionImage", required = false) MultipartFile descriptionImage) {
        return ResponseEntity.ok(jobPostService.updateJobPost(id, request, descriptionImage, user.getId()));
    }

    /**
     * 공고 마감 처리
     * PATCH /api/v1/job-posts/{id}/close
     */
    @PatchMapping("/{id}/close")
    public ResponseEntity<Void> closeJobPost(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        jobPostService.closeJobPost(id, user.getId());
        return ResponseEntity.ok().build();
    }

    /**
     * 공고 삭제
     * DELETE /api/v1/job-posts/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteJobPost(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        jobPostService.deleteJobPost(id, user.getId());
        return ResponseEntity.noContent().build();
    }
}
