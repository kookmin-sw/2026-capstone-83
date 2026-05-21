package com.itda.controller;

import com.itda.dto.request.ReviewRequest;
import com.itda.dto.response.ReviewResponse;
import com.itda.entity.User;
import com.itda.enums.ReviewTag;
import com.itda.enums.ReviewTarget;
import com.itda.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    // ─── 리뷰 작성 ──────────────────────────────────────────

    /**
     * 구직자 → 사업장 리뷰 작성
     * POST /api/v1/applications/{id}/reviews/employee
     */
    @PostMapping("/api/v1/applications/{id}/reviews/employee")
    public ResponseEntity<ReviewResponse> writeEmployeeReview(
            @PathVariable Long id,
            @AuthenticationPrincipal User user,
            @Valid @RequestBody ReviewRequest request) {
        ReviewResponse response = reviewService.writeEmployeeReview(id, user, request);
        return ResponseEntity.status(201).body(response);
    }

    /**
     * 고용주 → 구직자 리뷰 작성
     * POST /api/v1/applications/{id}/reviews/employer
     */
    @PostMapping("/api/v1/applications/{id}/reviews/employer")
    public ResponseEntity<ReviewResponse> writeEmployerReview(
            @PathVariable Long id,
            @AuthenticationPrincipal User user,
            @Valid @RequestBody ReviewRequest request) {
        ReviewResponse response = reviewService.writeEmployerReview(id, user, request);
        return ResponseEntity.status(201).body(response);
    }
    // ─── 리뷰 수정 ──────────────────────────────────────────
    // 리뷰 수정 (작성자만)
    @PutMapping("/api/v1/reviews/{id}")
    public ResponseEntity<ReviewResponse> updateReview(
            @PathVariable Long id,
            @AuthenticationPrincipal User user,
            @Valid @RequestBody ReviewRequest request) {
        return ResponseEntity.ok(reviewService.updateReview(id, user, request));
    }

    // 리뷰 삭제 (작성자만)
    @DeleteMapping("/api/v1/reviews/{id}")
    public ResponseEntity<Void> deleteReview(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        reviewService.deleteReview(id, user);
        return ResponseEntity.noContent().build();
    }

    // ─── 리뷰 조회 ──────────────────────────────────────────

    /**
     * 사업장 리뷰 목록 조회 (구직자→사업장)
     * GET /api/v1/workplaces/{id}/reviews
     */
    @GetMapping("/api/v1/workplaces/{id}/reviews")
    public ResponseEntity<List<ReviewResponse>> getWorkplaceReviews(@PathVariable Long id) {
        return ResponseEntity.ok(reviewService.getWorkplaceReviews(id));
    }

    /**
     * 구직자 리뷰 목록 조회 (고용주→구직자)
     * GET /api/v1/users/{id}/reviews
     */
    @GetMapping("/api/v1/users/{id}/reviews")
    public ResponseEntity<List<ReviewResponse>> getEmployeeReviews(@PathVariable Long id) {
        return ResponseEntity.ok(reviewService.getEmployeeReviews(id));
    }

    /**
     * 내가 작성한 리뷰 목록
     * GET /api/v1/reviews/my
     */
    @GetMapping("/api/v1/reviews/my")
    public ResponseEntity<List<ReviewResponse>> getMyReviews(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(reviewService.getMyReviews(user.getId()));
    }

    /**
     * 특정 application의 리뷰 조회
     * GET /api/v1/applications/{id}/reviews
     */
    @GetMapping("/api/v1/applications/{id}/reviews")
    public ResponseEntity<List<ReviewResponse>> getReviewsByApplication(@PathVariable Long id) {
        return ResponseEntity.ok(reviewService.getReviewsByApplication(id));
    }

    /**
     * 사용 가능한 태그 목록 조회 (방향별)
     * GET /api/v1/reviews/tags?target=EMPLOYEE_TO_WORKPLACE
     * GET /api/v1/reviews/tags?target=EMPLOYER_TO_EMPLOYEE
     */
    @GetMapping("/api/v1/reviews/tags")
    public ResponseEntity<Map<String, Object>> getAvailableTags(
            @RequestParam ReviewTarget target) {
        List<ReviewTag> tags = reviewService.getAvailableTags(target);
        List<Map<String, String>> tagList = tags.stream()
                .map(tag -> Map.of("name", tag.name(), "label", tag.getLabel()))
                .toList();
        return ResponseEntity.ok(Map.of("target", target.name(), "tags", tagList));
    }
}
