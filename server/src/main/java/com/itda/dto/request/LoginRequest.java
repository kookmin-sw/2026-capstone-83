package com.itda.dto.request;

/**
 * 로그인 요청 DTO
 * role: 사용자가 화면에서 선택한 회원 유형 (APPLICANT / EMPLOYER / MANAGER)
 *       서비스 단에서 실제 가입된 role과 일치하는지 검증한다.
 *       프론트가 보내지 않으면(null) 검증 생략 — 하위 호환.
 */
public record LoginRequest(
        String email,
        String password,
        String role
) {}
