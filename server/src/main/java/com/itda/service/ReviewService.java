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

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final ApplicationRepository applicationRepository;

    // ─── 리뷰 작성 ──────────────────────────────────────────

    /** 구직자 → 사업장 리뷰 작성 */
    @Transactional
    public ReviewResponse writeEmployeeReview(Long applicationId, User reviewer, ReviewRequest request) {
        Application application = getCompletedApplication(applicationId);

        if (!application.getApplicantUser().getId().equals(reviewer.getId())) {
            throw new AccessDeniedException("본인의 근무 내역에만 리뷰를 작성할 수 있습니다.");
        }
        if (reviewRepository.existsByApplicationIdAndTarget(applicationId, ReviewTarget.EMPLOYEE_TO_WORKPLACE)) {
            throw new DuplicateException("이미 해당 근무에 대한 리뷰를 작성했습니다.");
        }

        validateTags(request.tags(), ReviewTarget.EMPLOYEE_TO_WORKPLACE);
        validateContent(request);

        Review saved = reviewRepository.save(Review.builder()
                .application(application)
                .reviewer(reviewer)
                .target(ReviewTarget.EMPLOYEE_TO_WORKPLACE)
                .tags(request.tags() != null ? request.tags() : List.of())
                .content(request.content())
                .build());

        return ReviewResponse.from(saved);
    }

    /** 고용주 → 구직자 리뷰 작성 */
    @Transactional
    public ReviewResponse writeEmployerReview(Long applicationId, User reviewer, ReviewRequest request) {
        Application application = getCompletedApplication(applicationId);

        Long employerUserId = application.getJobPost().getWorkplace().getEmployer().getUser().getId();
        if (!employerUserId.equals(reviewer.getId())) {
            throw new AccessDeniedException("본인의 공고 근무자에게만 리뷰를 작성할 수 있습니다.");
        }
        if (reviewRepository.existsByApplicationIdAndTarget(applicationId, ReviewTarget.EMPLOYER_TO_EMPLOYEE)) {
            throw new DuplicateException("이미 해당 근무자에 대한 리뷰를 작성했습니다.");
        }

        validateTags(request.tags(), ReviewTarget.EMPLOYER_TO_EMPLOYEE);
        validateContent(request);

        Review saved = reviewRepository.save(Review.builder()
                .application(application)
                .reviewer(reviewer)
                .target(ReviewTarget.EMPLOYER_TO_EMPLOYEE)
                .tags(request.tags() != null ? request.tags() : List.of())
                .content(request.content())
                .build());

        return ReviewResponse.from(saved);
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
        return reviewRepository.findAll().stream()
                .filter(r -> r.getApplication().getId().equals(applicationId))
                .map(ReviewResponse::from).toList();
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
