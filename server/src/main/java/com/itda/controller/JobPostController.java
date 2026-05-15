package com.itda.controller;

import com.itda.dto.request.JobPostFilterRequest;
import com.itda.dto.request.JobPostCreateRequest;
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
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/job-posts")
@RequiredArgsConstructor
public class JobPostController {

    private final JobPostService jobPostService;
    private final WorkplaceRepository workplaceRepository;




    //공고 목록 통합 조회 (필터 + 커서 페이지네이션)
    //지원자/고용주 공통 사용 - 버튼은 프론트에서 role 기준으로 처리
    //GET /api/v1/job-posts?cursor=&size=&keyword=&jobCategory=&location=&sortType=
    @GetMapping
    public ResponseEntity<CursorPageResponse<JobPostCardResponse>> getJobPosts(
            @ModelAttribute JobPostFilterRequest filter,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(jobPostService.getJobPosts(filter, user));
    }


    /** 공고 상세 조회
    @GetMapping("/{id}")
    public ResponseEntity<JobPostDetailResponse> getJobPost(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(jobPostService.getJobPost(id, user));
    }**/
    @GetMapping("/{id}")
    public ResponseEntity<JobPostDetailResponse> getJobPost(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        System.out.println("=== 공고 상세 user: " + user);
        System.out.println("=== 공고 상세 user id: " + (user != null ? user.getId() : "null"));
        return ResponseEntity.ok(jobPostService.getJobPost(id, user));
    }

     // 고용주 본인 공고 목록 조회 (커서 페이지네이션)
     // GET /api/v1/employer/job-posts?cursor=&size=10
     @GetMapping("/employer")
     public ResponseEntity<CursorPageResponse<JobPostCardResponse>> getJobPostsByEmployer(
             @RequestParam(required = false) Long cursor,
             @RequestParam(defaultValue = "10") int size,
             @AuthenticationPrincipal User user) {
         return ResponseEntity.ok(jobPostService.getJobPostsByEmployer(user.getId(), cursor, size));
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
}