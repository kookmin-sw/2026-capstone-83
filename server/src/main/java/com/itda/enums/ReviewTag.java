package com.itda.enums;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum ReviewTag {

    // ── 구직자 → 사업장 긍정 태그 ──────────────────────────────
    GOOD_PAY("급여가 정확했어요", ReviewTarget.EMPLOYEE_TO_WORKPLACE),
    GOOD_ATMOSPHERE("분위기가 좋았어요", ReviewTarget.EMPLOYEE_TO_WORKPLACE),
    CLEAR_DESCRIPTION("업무 설명이 명확했어요", ReviewTarget.EMPLOYEE_TO_WORKPLACE),
    KIND_EMPLOYER("사장님이 친절했어요", ReviewTarget.EMPLOYEE_TO_WORKPLACE),
    EASY_WORK("업무 강도가 적당했어요", ReviewTarget.EMPLOYEE_TO_WORKPLACE),
    GOOD_LOCATION("교통이 편리했어요", ReviewTarget.EMPLOYEE_TO_WORKPLACE),

    // ── 구직자 → 사업장 부정 태그 ──────────────────────────────
    BAD_PAY("급여 지급이 불투명했어요", ReviewTarget.EMPLOYEE_TO_WORKPLACE),
    BAD_ATMOSPHERE("분위기가 불편했어요", ReviewTarget.EMPLOYEE_TO_WORKPLACE),
    UNCLEAR_DESCRIPTION("업무 설명이 부족했어요", ReviewTarget.EMPLOYEE_TO_WORKPLACE),
    UNKIND_EMPLOYER("사장님이 불친절했어요", ReviewTarget.EMPLOYEE_TO_WORKPLACE),
    HARD_WORK("업무 강도가 너무 높았어요", ReviewTarget.EMPLOYEE_TO_WORKPLACE),
    BAD_LOCATION("교통이 불편했어요", ReviewTarget.EMPLOYEE_TO_WORKPLACE),

    // ── 고용주 → 구직자 긍정 태그 ──────────────────────────────
    PUNCTUAL("시간을 잘 지켜요", ReviewTarget.EMPLOYER_TO_EMPLOYEE),
    HARD_WORKING("성실하게 일해요", ReviewTarget.EMPLOYER_TO_EMPLOYEE),
    QUICK_LEARNER("습득이 빨라요", ReviewTarget.EMPLOYER_TO_EMPLOYEE),
    GOOD_MANNER("매너가 좋아요", ReviewTarget.EMPLOYER_TO_EMPLOYEE),
    RESPONSIBLE("책임감이 강해요", ReviewTarget.EMPLOYER_TO_EMPLOYEE),
    WANT_REHIRE("다시 함께 일하고 싶어요", ReviewTarget.EMPLOYER_TO_EMPLOYEE),

    // ── 고용주 → 구직자 부정 태그 ──────────────────────────────
    LATE("시간을 잘 안 지켜요", ReviewTarget.EMPLOYER_TO_EMPLOYEE),
    LAZY("성실하지 않아요", ReviewTarget.EMPLOYER_TO_EMPLOYEE),
    SLOW_LEARNER("습득이 느려요", ReviewTarget.EMPLOYER_TO_EMPLOYEE),
    BAD_MANNER("매너가 아쉬워요", ReviewTarget.EMPLOYER_TO_EMPLOYEE),
    IRRESPONSIBLE("책임감이 부족해요", ReviewTarget.EMPLOYER_TO_EMPLOYEE),
    NO_REHIRE("다시 함께 일하기 어려워요", ReviewTarget.EMPLOYER_TO_EMPLOYEE);

    private final String label;
    private final ReviewTarget target;
}