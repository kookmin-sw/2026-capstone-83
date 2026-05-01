package com.itda.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@AllArgsConstructor
@Builder
public class LoginResponse {
    private Long userId;
    private String name;
    private String email;
    private String profileImageUrl;
    private String role;
    private boolean isNewUser;
    private String accessToken;
    private String refreshToken;
}
