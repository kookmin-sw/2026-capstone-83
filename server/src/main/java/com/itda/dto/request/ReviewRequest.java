package com.itda.dto.request;

import com.itda.enums.ReviewTag;
import jakarta.validation.constraints.Size;

import java.util.List;

/**
 * 리뷰 작성 요청 DTO
 * - tags: 선택 태그 목록 (0개 이상, 본인 방향에 맞는 태그여야 함)
 * - content: 텍스트 리뷰 (선택, 최대 500자)
 * tags, content 둘 다 비어있으면 안 됨 (서비스에서 검증)
 */
public record ReviewRequest(

        @Size(max = 10, message = "태그는 최대 10개까지 선택 가능합니다.")
        List<ReviewTag> tags,

        @Size(max = 500, message = "텍스트 리뷰는 최대 500자입니다.")
        String content
) {}
