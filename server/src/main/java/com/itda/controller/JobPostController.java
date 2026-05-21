package com.itda.controller;

import com.itda.dto.request.JobPostFilterRequest;
import com.itda.dto.request.JobPostCreateRequest;
import com.itda.dto.request.JobPostUpdateRequest;
import com.itda.dto.response.CursorPageResponse;
import com.itda.dto.response.JobPostCardResponse;
import com.itda.dto.response.JobPostDetailResponse;
import com.itda.entity.JobPost;
import com.itda.entity.User;
import com.itda.entity.Workplace;
import com.itda.repository.WorkplaceRepository;
import com.itda.service.JobPostService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/job-posts")
@RequiredArgsConstructor
public class JobPostController {

    private final JobPostService jobPostService;
    private final WorkplaceRepository workplaceRepository;




    //공고 목록 통합 조회 (필터 + 커서 페이지네이션)
    //지원자/고용주 공통 사용 - 버튼은 프론트에서 role 기준으로 처리
    //GET /api/v1/job-posts?cursor=&size=&keyword=&jobCategory=&location=&sortType=
    //
    // 응답 헤더 X-Request-Id : 해당 응답의 노출 묶음 식별자(UUID).
    //   프론트는 사용자가 카드 클릭 시 같은 값을 X-Request-Id 헤더로 되돌려 보내
    //   클릭과 노출을 정확히 묶을 수 있게 한다 (NDCG@10 계산용).
    // Cache-Control: no-store
    //   request_id 가 응답과 함께 캐시되어 잘못 재사용되는 사고 방지.
    @GetMapping
    public ResponseEntity<CursorPageResponse<JobPostCardResponse>> getJobPosts(
            @ModelAttribute JobPostFilterRequest filter,
            @AuthenticationPrincipal User user) {
        String requestId = UUID.randomUUID().toString();
        CursorPageResponse<JobPostCardResponse> body =
                jobPostService.getJobPosts(filter, user, requestId);
        return ResponseEntity.ok()
                .header("X-Request-Id", requestId)
                .header("Cache-Control", "no-store")
                .body(body);
    }


    //공고 상세 조회
    // X-Request-Id, X-Referrer-Sort-Type : 노출 ↔ 클릭 매핑용 (있으면 정확, 없어도 시간 윈도우 조인으로 동작)
    @GetMapping("/{id}")
    public ResponseEntity<JobPostDetailResponse> getJobPost(
            @PathVariable Long id,
            @AuthenticationPrincipal User user,
            @RequestHeader(value = "X-Request-Id", required = false) String requestId,
            @RequestHeader(value = "X-Referrer-Sort-Type", required = false) String referrerSortType) {
        return ResponseEntity.ok(
                jobPostService.getJobPost(id, user, requestId, referrerSortType));
    }


    // 고용주 본인 공고 목록 조회 (커서 페이지네이션, status 필터 선택적)
    @GetMapping("/employer")
    public ResponseEntity<CursorPageResponse<JobPostCardResponse>> getJobPostsByEmployer(
            @RequestParam(required = false) Long cursor,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String status,  // 추가
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(jobPostService.getJobPostsByEmployer(user.getId(), cursor, size, status));
    }

    // 제안 가능 공고 목록 조회 (OPEN + 해당 구직자와 연결된 공고 제외)
    @GetMapping("/employer/offerable")
    public ResponseEntity<CursorPageResponse<JobPostCardResponse>> getOfferableJobPosts(
            @RequestParam Long applicantUserId,
            @RequestParam(required = false) Long cursor,
            @RequestParam(defaultValue = "10") int size,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(jobPostService.getOfferableJobPosts(user.getId(), applicantUserId, cursor, size));
    }

    // 캘린더용 날짜 범위 공고 조회
    // GET /api/v1/job-posts/employer/calendar?start=&end=
    @GetMapping("/employer/calendar")
    public ResponseEntity<List<JobPost>> getJobPostsByDateRange(
            @AuthenticationPrincipal User user,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end) {
        return ResponseEntity.ok(jobPostService.getJobPostsByDateRange(user.getId(), start, end));
    }


    //공고 등록 POST /api/v1/job-posts?workplaceId=1
    //multipart/form-data 각 필드를 JobPostCreateRequest DTO에 자동 매핑

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<JobPostDetailResponse> createJobPost(
            @RequestParam Long workplaceId,
            @ModelAttribute JobPostCreateRequest request,
            @RequestPart(value = "companyLogoImage", required = false) MultipartFile companyLogoImage,
            @RequestPart(value = "descriptionImage", required = false) MultipartFile descriptionImage) {
        Workplace workplace = workplaceRepository.findById(workplaceId)
                .orElseThrow(() -> new RuntimeException("사업장을 찾을 수 없습니다."));
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(jobPostService.createJobPost(request, workplace, companyLogoImage, descriptionImage));
    }

    // 공고 마감 처리
    @PatchMapping("/{id}/close")
    public ResponseEntity<Void> closeJobPost(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        jobPostService.closeJobPost(id, user.getId());
        return ResponseEntity.ok().build();
    }

    /**
     * 공고 수정 (multipart/form-data, 부분 수정)
     * PUT /api/v1/job-posts/{id}
     * - data: JobPostUpdateRequest JSON (null 필드는 기존 값 유지)
     * - descriptionImage: 새 상세 이미지 (선택, 없으면 기존 유지)
     */
    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<JobPostDetailResponse> updateJobPost(
            @PathVariable Long id,
            @RequestPart("data") JobPostUpdateRequest request,
            @RequestPart(value = "descriptionImage", required = false) MultipartFile descriptionImage,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(jobPostService.updateJobPost(id, request, descriptionImage, user.getId()));
    }

    /**
     * 공고 삭제
     * DELETE /api/v1/job-posts/{id}
     * - 본인 공고만 삭제 가능
     * - 채용 확정된 지원자가 있으면 삭제 불가 (409)
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteJobPost(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        jobPostService.deleteJobPost(id, user.getId());
        return ResponseEntity.noContent().build();
    }

}