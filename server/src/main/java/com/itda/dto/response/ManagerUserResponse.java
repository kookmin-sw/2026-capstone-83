package com.itda.dto.response;

import com.itda.entity.User;
import com.itda.enums.UserRole;
import com.itda.enums.UserStatus;

import java.time.LocalDateTime;

public record ManagerUserResponse(
        Long id,
        String name,
        UserRole role,
        String email,
        String phone,
        LocalDateTime createdAt,
        UserStatus status,
        LocalDateTime suspendedAt,
        LocalDateTime suspendedUntil,
        String suspendReason,
        long reportCount,
        long matchCount
) {
    public static ManagerUserResponse from(User user, long reportCount, long matchCount) {
        return new ManagerUserResponse(
                user.getId(),
                user.getName(),
                user.getRole(),
                user.getEmail(),
                user.getPhone(),
                user.getCreatedAt(),
                user.getStatus(),
                user.getSuspendedAt(),
                user.getSuspendedUntil(),
                user.getSuspendReason(),
                reportCount,
                matchCount
        );
    }
}
