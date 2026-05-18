package com.itda.dto.request;

/**
 * 회원정보 수정 요청 DTO.
 * null 필드는 기존 값을 유지한다 (부분 수정).
 * email은 수정 불가 (로그인 식별자).
 */
public record UserProfileUpdateRequest(
        String name,
        String phone,
        String birth,
        String gender,
        String location
) {}
