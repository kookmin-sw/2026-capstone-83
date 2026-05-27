package com.itda.dto.request;

import java.util.List;

/**
 * @param userIds      제안 대상 구직자 user id 목록
 * @param instantHire  true면 자동 일괄 제안(즉시 채용 오퍼), false/null이면 일반 일괄 제안
 */
public record BulkOfferRequest(
        List<Long> userIds,
        Boolean instantHire
) {
    /** 하위 호환: instantHire 없이 호출 시 일반 제안(false) */
    public BulkOfferRequest(List<Long> userIds) {
        this(userIds, Boolean.FALSE);
    }
}