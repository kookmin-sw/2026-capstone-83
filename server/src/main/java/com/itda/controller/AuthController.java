package com.itda.controller;

import com.itda.dto.response.LoginResponse;
import com.itda.entity.User;
import com.itda.enums.UserRole;
import com.itda.repository.UserRepository;
import com.itda.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthService authService;

    /**
     * 카카오 로그인
     * 프론트에서 카카오 인가 코드(code)를 받아서 전달
     */
    @PostMapping("/kakao")
    public ResponseEntity<LoginResponse> kakaoLogin(@RequestParam String code) {
        return ResponseEntity.ok(authService.kakaoLogin(code));
    }

    // 테스트용 회원가입
    @PostMapping("/register")
    public ResponseEntity<User> register(@RequestBody RegisterRequest request) {
        User user = User.builder()
                .loginId(request.loginId())
                .password(passwordEncoder.encode(request.password()))
                .name(request.name())
                .email(request.email())
                .phone(request.phone())
                .role(UserRole.valueOf(request.role()))
                .build();
        return ResponseEntity.ok(userRepository.save(user));
    }

    // 테스트용 로그인
    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody LoginRequest request) {
        User user = userRepository.findByLoginId(request.loginId())
                .orElseThrow(() -> new RuntimeException("유저를 찾을 수 없습니다."));

        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            return ResponseEntity.status(401).body("비밀번호가 틀렸습니다.");
        }

        return ResponseEntity.ok("로그인 성공! userId: " + user.getId() + ", role: " + user.getRole());
    }

    record RegisterRequest(String loginId, String password, String name, String email, String phone, String role) {}
    record LoginRequest(String loginId, String password) {}
}
