package com.itda.service;

import com.itda.config.JwtTokenProvider;
import com.itda.dto.response.KakaoUserResponse;
import com.itda.dto.response.LoginResponse;
import com.itda.entity.User;
import com.itda.enums.OAuthProvider;
import com.itda.enums.UserRole;
import com.itda.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final KakaoOAuthService kakaoOAuthService;
    private final JwtTokenProvider jwtTokenProvider;

    @Transactional
    public LoginResponse kakaoLogin(String code) {
        // 1. 인가 코드로 카카오 액세스 토큰 발급
        String kakaoAccessToken = kakaoOAuthService.getAccessToken(code);

        // 2. 액세스 토큰으로 카카오 사용자 정보 조회
        KakaoUserResponse kakaoUser = kakaoOAuthService.getUserInfo(kakaoAccessToken);

        // 3. DB에서 기존 유저 조회 or 신규 가입
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
                    .role(UserRole.APPLICANT) // 기본 역할: 지원자
                    .build();
            user = userRepository.save(user);
        } else {
            user = existingUser.get();
        }

        // 4. JWT 토큰 발급
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
}
