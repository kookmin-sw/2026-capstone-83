package com.itda.service;

import com.itda.dto.request.ReviewRequest;
import com.itda.dto.response.ReviewResponse;
import com.itda.entity.Application;
import com.itda.entity.Review;
import com.itda.entity.User;
import com.itda.enums.ApplicationStatus;
import com.itda.enums.ReviewTag;
import com.itda.enums.ReviewTarget;
import com.itda.exception.DuplicateException;
import com.itda.exception.NotFoundException;
import com.itda.repository.ApplicationRepository;
import com.itda.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Stream;



@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final ApplicationRepository applicationRepository;

    // ─── 리뷰 작성 ──────────────────────────────────────────

    /** 구직자 → 사업장 리뷰 작성 (같은 사업장+구직자 조합이면 UPDATE) */
    @Transactional
    public ReviewResponse writeEmployeeReview(Long applicationId, User reviewer, ReviewRequest request) {
        Application application = getCompletedApplication(applicationId);

        if (!application.getApplicantUser().getId().equals(reviewer.getId())) {
            throw new AccessDeniedException("본인의 근무 내역에만 리뷰를 작성할 수 있습니다.");
        }

        validateTags(request.tags(), ReviewTarget.EMPLOYEE_TO_WORKPLACE);
        validateContent(request);

        Long workplaceId = application.getJobPost().getWorkplace().getId();
        Long applicantUserId = application.getApplicantUser().getId();

        // 같은 사업장+구직자 조합 기존 리뷰 있으면 UPDATE
        Optional<Review> existing = reviewRepository
                .findEmployeeReviewByWorkplaceAndApplicant(workplaceId, applicantUserId);

        if (existing.isPresent()) {
            existing.get().update(
                    request.tags() != null ? request.tags() : List.of(),
                    request.content()
            );
            return ReviewResponse.from(reviewRepository.save(existing.get()));
        }

        Review saved = reviewRepository.save(Review.builder()
                .application(application)
                .reviewer(reviewer)
                .target(ReviewTarget.EMPLOYEE_TO_WORKPLACE)
                .tags(request.tags() != null ? request.tags() : List.of())
                .content(request.content())
                .build());

        return ReviewResponse.from(saved);
    }

    // 고용주 → 구직자 리뷰 작성 (같은 고용주+구직자 조합이면 UPDATE)
    @Transactional
    public ReviewResponse writeEmployerReview(Long applicationId, User reviewer, ReviewRequest request) {
        Application application = getCompletedApplication(applicationId);

        Long employerUserId = application.getJobPost().getWorkplace().getEmployer().getUser().getId();
        if (!employerUserId.equals(reviewer.getId())) {
            throw new AccessDeniedException("본인의 공고 근무자에게만 리뷰를 작성할 수 있습니다.");
        }

        validateTags(request.tags(), ReviewTarget.EMPLOYER_TO_EMPLOYEE);
        validateContent(request);

        Long applicantUserId = application.getApplicantUser().getId();

        // 같은 고용주+구직자 조합 기존 리뷰 있으면 UPDATE
        Optional<Review> existing = reviewRepository
                .findByReviewerIdAndApplicantUserId(reviewer.getId(), applicantUserId);

        if (existing.isPresent()) {
            existing.get().update(
                    request.tags() != null ? request.tags() : List.of(),
                    request.content()
            );
            return ReviewResponse.from(reviewRepository.save(existing.get()));
        }

        Review saved = reviewRepository.save(Review.builder()
                .application(application)
                .reviewer(reviewer)
                .target(ReviewTarget.EMPLOYER_TO_EMPLOYEE)
                .tags(request.tags() != null ? request.tags() : List.of())
                .content(request.content())
                .build());

        return ReviewResponse.from(saved);
    }
    // ─── 리뷰 수정 ──────────────────────────────────────────
    // 리뷰 수정 (작성자만)
    @Transactional
    public ReviewResponse updateReview(Long reviewId, User reviewer, ReviewRequest request) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new NotFoundException("리뷰를 찾을 수 없습니다."));

        if (!review.getReviewer().getId().equals(reviewer.getId())) {
            throw new AccessDeniedException("본인의 리뷰만 수정할 수 있습니다.");
        }

        validateTags(request.tags(), review.getTarget());
        validateContent(request);

        review.update(
                request.tags() != null ? request.tags() : List.of(),
                request.content()
        );
        return ReviewResponse.from(reviewRepository.save(review));
    }

    // 리뷰 삭제 (작성자만)
    @Transactional
    public void deleteReview(Long reviewId, User reviewer) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new NotFoundException("리뷰를 찾을 수 없습니다."));

        if (!review.getReviewer().getId().equals(reviewer.getId())) {
            throw new AccessDeniedException("본인의 리뷰만 삭제할 수 있습니다.");
        }

        reviewRepository.delete(review);
    }



    // 고용주가 특정 구직자에게 작성한 리뷰 조회 (이력서 노출용)
    public List<ReviewResponse> getReviewsByReviewerAndApplicant(Long reviewerId, Long applicantUserId) {
        return reviewRepository.findByReviewerIdAndApplicantUserIdAll(reviewerId, applicantUserId)
                .stream().map(ReviewResponse::from).toList();
    }

    // ─── 리뷰 조회 ──────────────────────────────────────────

    public List<ReviewResponse> getWorkplaceReviews(Long workplaceId) {
        return reviewRepository.findWorkplaceReviews(workplaceId)
                .stream().map(ReviewResponse::from).toList();
    }

    public List<ReviewResponse> getEmployeeReviews(Long userId) {
        return reviewRepository.findEmployeeReviews(userId)
                .stream().map(ReviewResponse::from).toList();
    }

    public List<ReviewResponse> getMyReviews(Long reviewerId) {
        return reviewRepository.findByReviewerIdOrderByCreatedAtDesc(reviewerId)
                .stream().map(ReviewResponse::from).toList();
    }

    public List<ReviewResponse> getReviewsByApplication(Long applicationId) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new NotFoundException("지원 내역을 찾을 수 없습니다."));

        // 해당 application에 직접 연결된 리뷰
        List<Review> direct = reviewRepository.findAll().stream()
                .filter(r -> r.getApplication().getId().equals(applicationId))
                .toList();

        // 고용주+구직자 조합으로 EMPLOYER_TO_EMPLOYEE 리뷰 조회
        Long employerUserId = application.getJobPost().getWorkplace().getEmployer().getUser().getId();
        Long applicantUserId = application.getApplicantUser().getId();
        List<Review> employerReviews = reviewRepository
                .findEmployerReviewByEmployerAndApplicant(employerUserId, applicantUserId);

        // 중복 제거 후 합치기
        List<Review> merged = Stream.concat(direct.stream(), employerReviews.stream())
                .distinct()
                .toList();

        return merged.stream().map(ReviewResponse::from).toList();
    }

    public List<ReviewTag> getAvailableTags(ReviewTarget target) {
        return List.of(ReviewTag.values()).stream()
                .filter(tag -> tag.getTarget() == target)
                .toList();
    }

    // ─── 내부 헬퍼 ──────────────────────────────────────────

    private Application getCompletedApplication(Long applicationId) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new NotFoundException("지원 내역을 찾을 수 없습니다."));
        if (application.getStatus() != ApplicationStatus.COMPLETED) {
            throw new IllegalStateException("근무가 완료된 경우에만 리뷰를 작성할 수 있습니다.");
        }
        return application;
    }

    private void validateTags(List<ReviewTag> tags, ReviewTarget expectedTarget) {
        if (tags == null || tags.isEmpty()) return;
        if (tags.stream().anyMatch(tag -> tag.getTarget() != expectedTarget)) {
            throw new IllegalArgumentException("올바르지 않은 태그가 포함되어 있습니다.");
        }
    }

    private void validateContent(ReviewRequest request) {
        boolean tagsEmpty = request.tags() == null || request.tags().isEmpty();
        boolean contentEmpty = request.content() == null || request.content().isBlank();
        if (tagsEmpty && contentEmpty) {
            throw new IllegalArgumentException("태그 또는 텍스트 리뷰 중 하나는 입력해야 합니다.");
        }
    }
}
