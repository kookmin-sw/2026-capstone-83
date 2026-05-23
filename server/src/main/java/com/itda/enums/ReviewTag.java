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

    // ── 고용주 → 구직자 태그 ──────────────────────────────
    GOOD("좋아요", ReviewTarget.EMPLOYER_TO_EMPLOYEE),
    NEUTRAL("무난해요", ReviewTarget.EMPLOYER_TO_EMPLOYEE),
    BAD("싫어요", ReviewTarget.EMPLOYER_TO_EMPLOYEE),;

    private final String label;
    private final ReviewTarget target;
}