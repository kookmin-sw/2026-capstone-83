package com.itda.controller;

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
@RequestMapping("/api/job-posts")
@RequiredArgsConstructor
public class JobPostController {

    private final JobPostService jobPostService;
    private final WorkplaceRepository workplaceRepository;

    // 모집중인 공고 전체 조회
    @GetMapping
    public ResponseEntity<List<JobPost>> getOpenJobPosts() {
        return ResponseEntity.ok(jobPostService.getOpenJobPosts());
    }

    // 급여 높은 순
    @GetMapping("/sort/wage")
    public ResponseEntity<List<JobPost>> getJobPostsByWage() {
        return ResponseEntity.ok(jobPostService.getJobPostsOrderByWage());
    }

    // 마감 임박순
    @GetMapping("/sort/deadline")
    public ResponseEntity<List<JobPost>> getJobPostsByDeadline() {
        return ResponseEntity.ok(jobPostService.getJobPostsOrderByDeadline());
    }

    // 키워드 검색
    @GetMapping("/search")
    public ResponseEntity<List<JobPost>> searchJobPosts(@RequestParam String keyword) {
        return ResponseEntity.ok(jobPostService.searchJobPosts(keyword));
    }

    // 공고 상세 조회
    @GetMapping("/{id}")
    public ResponseEntity<JobPost> getJobPost(@PathVariable Long id) {
        return ResponseEntity.ok(jobPostService.getJobPost(id));
    }

    // 고용주 공고 목록
    @GetMapping("/employer/{employerId}")
    public ResponseEntity<List<JobPost>> getJobPostsByEmployer(@PathVariable Long employerId) {
        return ResponseEntity.ok(jobPostService.getJobPostsByEmployer(employerId));
    }

    // 캘린더용 날짜 범위 조회
    @GetMapping("/employer/{employerId}/calendar")
    public ResponseEntity<List<JobPost>> getJobPostsByDateRange(
            @PathVariable Long employerId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end) {
        return ResponseEntity.ok(jobPostService.getJobPostsByDateRange(employerId, start, end));
    }

    // 공고 등록
    @PostMapping
    public ResponseEntity<JobPost> createJobPost(
            @RequestParam Long workplaceId,
            @RequestBody JobPost jobPost) {
        Workplace workplace = workplaceRepository.findById(workplaceId)
                .orElseThrow(() -> new RuntimeException("사업장을 찾을 수 없습니다."));
        JobPost newJobPost = JobPost.builder()
                .workplace(workplace)
                .title(jobPost.getTitle())
                .s3ContentUrl(jobPost.getS3ContentUrl())
                .wage(jobPost.getWage())
                .wageType(jobPost.getWageType())
                .workDate(jobPost.getWorkDate())
                .workStart(jobPost.getWorkStart())
                .workEnd(jobPost.getWorkEnd())
                .totalSlots(jobPost.getTotalSlots())
                .status(jobPost.getStatus())
                .deadline(jobPost.getDeadline())
                .build();
        return ResponseEntity.ok(jobPostService.createJobPost(newJobPost));
    }

    // 공고 마감
    @PatchMapping("/{id}/close")
    public ResponseEntity<Void> closeJobPost(@PathVariable Long id) {
        jobPostService.closeJobPost(id);
        return ResponseEntity.ok().build();
    }
}