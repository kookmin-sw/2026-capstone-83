package com.itda.enums;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

/**
 * 리뷰 태그 Enum
 * - EMPLOYEE_TO_WORKPLACE: 구직자 → 사업장 리뷰 시 사용
 * - EMPLOYER_TO_EMPLOYEE: 고용주 → 구직자 리뷰 시 사용
 */
@Getter
@RequiredArgsConstructor
public enum ReviewTag {

    // ── 구직자 → 사업장 태그 ──────────────────────────────
    GOOD_PAY("급여가 정확했어요", ReviewTarget.EMPLOYEE_TO_WORKPLACE),
    GOOD_ATMOSPHERE("분위기가 좋았어요", ReviewTarget.EMPLOYEE_TO_WORKPLACE),
    CLEAR_DESCRIPTION("업무 설명이 명확했어요", ReviewTarget.EMPLOYEE_TO_WORKPLACE),
    KIND_EMPLOYER("사장님이 친절했어요", ReviewTarget.EMPLOYEE_TO_WORKPLACE),
    EASY_WORK("업무 강도가 적당했어요", ReviewTarget.EMPLOYEE_TO_WORKPLACE),
    GOOD_LOCATION("교통이 편리했어요", ReviewTarget.EMPLOYEE_TO_WORKPLACE),

    // ── 고용주 → 구직자 태그 ──────────────────────────────
    PUNCTUAL("시간을 잘 지켜요", ReviewTarget.EMPLOYER_TO_EMPLOYEE),
    HARD_WORKING("성실하게 일해요", ReviewTarget.EMPLOYER_TO_EMPLOYEE),
    QUICK_LEARNER("습득이 빨라요", ReviewTarget.EMPLOYER_TO_EMPLOYEE),
    GOOD_MANNER("매너가 좋아요", ReviewTarget.EMPLOYER_TO_EMPLOYEE),
    RESPONSIBLE("책임감이 강해요", ReviewTarget.EMPLOYER_TO_EMPLOYEE),
    WANT_REHIRE("다시 함께 일하고 싶어요", ReviewTarget.EMPLOYER_TO_EMPLOYEE);

    private final String label;
    private final ReviewTarget target;
}
