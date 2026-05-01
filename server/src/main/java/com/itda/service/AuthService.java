package com.itda.service;

import com.itda.config.JwtTokenProvider;
import com.itda.dto.request.LoginRequest;
import com.itda.dto.request.SignupRequest;
import com.itda.dto.response.KakaoUserResponse;
import com.itda.dto.response.LoginResponse;
import com.itda.entity.Employer;
import com.itda.entity.User;
import com.itda.enums.OAuthProvider;
import com.itda.enums.UserRole;
import com.itda.exception.DuplicateException;
import com.itda.exception.NotFoundException;
import com.itda.repository.EmployerRepository;
import com.itda.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final EmployerRepository employerRepository;
    private final PasswordEncoder passwordEncoder;
    private final KakaoOAuthService kakaoOAuthService;
    private final JwtTokenProvider jwtTokenProvider;

    @Transactional
    public void signup(SignupRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new DuplicateException("이미 가입된 이메일입니다.");
        }

        UserRole role = UserRole.valueOf(request.role());

        User user = User.builder()
                .email(request.email())
                .password(passwordEncoder.encode(request.password()))
                .name(request.name())
                .birth(request.birth() != null ? LocalDate.parse(request.birth()) : null)
                .gender(request.gender())
                .phone(request.phone())
                .location(request.location())
                .role(role)
                .build();

        user = userRepository.save(user);

        if (role == UserRole.EMPLOYER) {
            Employer employer = Employer.builder()
                    .user(user)
                    .businessNumber(request.businessNumber())
                    .build();
            employerRepository.save(employer);
        }
    }

    @Transactional(readOnly = true)
    public AuthTokens login(LoginRequest request) {
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new NotFoundException("이메일 또는 비밀번호가 올바르지 않습니다."));

        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new IllegalArgumentException("이메일 또는 비밀번호가 올바르지 않습니다.");
        }

        String accessToken = jwtTokenProvider.createAccessToken(user.getId(), user.getRole().name());
        String refreshToken = jwtTokenProvider.createRefreshToken(user.getId(), user.getRole().name());

        return new AuthTokens(accessToken, refreshToken, user.getRole().name());
    }

    public AuthTokens refresh(String refreshToken) {
        if (!jwtTokenProvider.validateToken(refreshToken)) {
            throw new IllegalArgumentException("유효하지 않은 리프레시 토큰입니다.");
        }

        Long userId = jwtTokenProvider.getUserId(refreshToken);
        String role = jwtTokenProvider.getRole(refreshToken);

        String newAccessToken = jwtTokenProvider.createAccessToken(userId, role);
        String newRefreshToken = jwtTokenProvider.createRefreshToken(userId, role);

        return new AuthTokens(newAccessToken, newRefreshToken, role);
    }

    @Transactional
    public LoginResponse kakaoLogin(String code) {
        String kakaoAccessToken = kakaoOAuthService.getAccessToken(code);
        KakaoUserResponse kakaoUser = kakaoOAuthService.getUserInfo(kakaoAccessToken);

        String kakaoId = String.valueOf(kakaoUser.getId());
        Optional<User> existingUser = userRepository.findByOauthProviderAndOauthProviderId(
                OAuthProvider.KAKAO, kakaoId);

        boolean isNewUser = existingUser.isEmpty();

        User user;
        if (isNewUser) {
            KakaoUserResponse.KakaoAccount account = kakaoUser.getKakaoAccount();
            KakaoUserResponse.KakaoAccount.Profile profile = account.getProfile();

            user = User.builder()
                    .oauthProvider(OAuthProvider.KAKAO)
                    .oauthProviderId(kakaoId)
                    .name(profile.getNickname())
                    .email(account.getEmail() != null ? account.getEmail() : "")
                    .phone(account.getPhoneNumber() != null ? account.getPhoneNumber() : "")
                    .profileImageUrl(profile.getProfileImageUrl())
                    .role(UserRole.APPLICANT)
                    .build();
            user = userRepository.save(user);
        } else {
            user = existingUser.get();
        }

        String accessToken = jwtTokenProvider.createAccessToken(user.getId(), user.getRole().name());
        String refreshToken = jwtTokenProvider.createRefreshToken(user.getId(), user.getRole().name());

        return LoginResponse.builder()
                .userId(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .profileImageUrl(user.getProfileImageUrl())
                .role(user.getRole().name())
                .isNewUser(isNewUser)
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .build();
    }

    public record AuthTokens(String accessToken, String refreshToken, String role) {}
}
