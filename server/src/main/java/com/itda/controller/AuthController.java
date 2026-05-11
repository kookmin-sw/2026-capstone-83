package com.itda.controller;

import com.itda.dto.request.LoginRequest;
import com.itda.dto.request.SignupRequest;
import com.itda.dto.response.AuthResponse;
import com.itda.dto.response.LoginResponse;
import com.itda.dto.response.RefreshResponse;
import com.itda.service.AuthService;
import com.itda.service.AuthService.AuthTokens;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @Value("${jwt.refresh-token-expiry}")
    private long refreshTokenExpiry;

    @PostMapping("/signup")
    public ResponseEntity<Void> signup(@RequestBody SignupRequest request) {
        authService.signup(request);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request,
                                              HttpServletResponse response) {
        AuthTokens tokens = authService.login(request);
        addRefreshTokenCookie(response, tokens.refreshToken());

        return ResponseEntity.ok(AuthResponse.builder()
                .accessToken(tokens.accessToken())
                .role(tokens.role())
                .build());
    }

    @PostMapping("/refresh")
    public ResponseEntity<RefreshResponse> refresh(HttpServletRequest request,
                                                   HttpServletResponse response) {
        String refreshToken = extractRefreshTokenFromCookie(request);
        if (refreshToken == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        AuthTokens tokens = authService.refresh(refreshToken);
        addRefreshTokenCookie(response, tokens.refreshToken());

        // role은 로그인 시 이미 클라이언트가 받아 보관 중이므로
        // refresh 응답에는 새 accessToken만 내려준다.
        return ResponseEntity.ok(RefreshResponse.builder()
                .accessToken(tokens.accessToken())
                .build());
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletResponse response) {
        Cookie cookie = new Cookie("refreshToken", null);
        cookie.setHttpOnly(true);
        cookie.setSecure(false);
        cookie.setPath("/");
        cookie.setMaxAge(0);
        response.addCookie(cookie);

        return ResponseEntity.ok().build();
    }

    @PostMapping("/auth/kakao")
    public ResponseEntity<LoginResponse> kakaoLogin(@RequestParam String code) {
        return ResponseEntity.ok(authService.kakaoLogin(code));
    }

    private void addRefreshTokenCookie(HttpServletResponse response, String refreshToken) {
        Cookie cookie = new Cookie("refreshToken", refreshToken);
        cookie.setHttpOnly(true);
        cookie.setSecure(false);
        cookie.setPath("/");
        cookie.setMaxAge((int) (refreshTokenExpiry / 1000));
        response.addCookie(cookie);
    }

    private String extractRefreshTokenFromCookie(HttpServletRequest request) {
        if (request.getCookies() == null) return null;
        for (Cookie cookie : request.getCookies()) {
            if ("refreshToken".equals(cookie.getName())) {
                return cookie.getValue();
            }
        }
        return null;
    }
}
