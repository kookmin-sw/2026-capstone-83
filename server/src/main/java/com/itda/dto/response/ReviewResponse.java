package com.itda.dto.response;

import com.itda.entity.Review;
import com.itda.enums.ReviewTag;
import com.itda.enums.ReviewTarget;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 리뷰 응답 DTO
 */
public record ReviewResponse(
        Long reviewId,
        Long applicationId,
        ReviewTarget target,
        Long reviewerId,
        String reviewerName,
        String reviewerProfileImageUrl,
        List<ReviewTag> tags,
        List<String> tagLabels,         // 태그 한글 라벨
        String content,
        LocalDateTime createdAt
) {
    public static ReviewResponse from(Review review) {
        List<ReviewTag> tags = review.getTags() != null ? review.getTags() : List.of();
        return new ReviewResponse(
                review.getId(),
                review.getApplication().getId(),
                review.getTarget(),
                review.getReviewer().getId(),
                review.getReviewer().getName(),
                review.getReviewer().getProfileImageUrl(),
                tags,
                tags.stream().map(ReviewTag::getLabel).toList(),
                review.getContent(),
                review.getCreatedAt()
        );
    }
}
