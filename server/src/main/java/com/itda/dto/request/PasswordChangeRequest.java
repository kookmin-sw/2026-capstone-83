package com.itda.dto.request;

/**
 * 비밀번호 변경 요청 DTO.
 */
public record PasswordChangeRequest(
        String currentPassword,
        String newPassword
) {}
