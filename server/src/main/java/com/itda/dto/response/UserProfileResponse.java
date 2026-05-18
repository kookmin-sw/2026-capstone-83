package com.itda.dto.response;

import com.itda.entity.User;

public record UserProfileResponse(
        Long userId,
        String name,
        String email,
        String phone,
        String birth,
        String gender,
        String location,
        String profileImageUrl,
        String role
) {
    public static UserProfileResponse from(User user) {
        return new UserProfileResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getPhone(),
                user.getBirth() != null ? user.getBirth().toString() : null,
                user.getGender() != null ? user.getGender().name() : null,
                user.getLocation(),
                user.getProfileImageUrl(),
                user.getRole().name()
        );
    }
}
