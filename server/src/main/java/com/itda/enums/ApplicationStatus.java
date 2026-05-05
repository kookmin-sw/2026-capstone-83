package com.itda.enums;

public enum ApplicationStatus {
    APPLIED,   // 지원자 → 공고 지원 (검토 대기 중)
    OFFERED,   // 고용주 → 지원자에게 제안
    PENDING,   // 지원자가 제안 수락 (고용주 최종 확정 대기)
    HIRED,     // 채용 확정
    REJECTED   // 거절
}