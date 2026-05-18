package com.itda.service;

import com.itda.dto.request.PasswordChangeRequest;
import com.itda.dto.request.UserProfileUpdateRequest;
import com.itda.dto.response.UserProfileResponse;
import com.itda.entity.User;
import com.itda.enums.Gender;
import com.itda.exception.NotFoundException;
import com.itda.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final S3Service s3Service;

    public UserProfileResponse getMyProfile(Long userId) {
        User user = findUser(userId);
        return UserProfileResponse.from(user);
    }

    @Transactional
    public UserProfileResponse updateMyProfile(Long userId, UserProfileUpdateRequest request) {
        User user = findUser(userId);

        // Builder로 새 객체 생성 (null 필드는 기존 값 유지)
        User updated = User.builder()
                .id(user.getId())
                .oauthProvider(user.getOauthProvider())
                .oauthProviderId(user.getOauthProviderId())
                .loginId(user.getLoginId())
                .password(user.getPassword())
                .name(request.name() != null ? request.name() : user.getName())
                .email(user.getEmail())
                .phone(request.phone() != null ? request.phone() : user.getPhone())
                .birth(request.birth() != null ? LocalDate.parse(request.birth()) : user.getBirth())
                .gender(request.gender() != null ? Gender.valueOf(request.gender()) : user.getGender())
                .location(request.location() != null ? request.location() : user.getLocation())
                .profileImageUrl(user.getProfileImageUrl())
                .role(user.getRole())
                .status(user.getStatus())
                .suspendedAt(user.getSuspendedAt())
                .suspendedUntil(user.getSuspendedUntil())
                .suspendReason(user.getSuspendReason())
                .createdAt(user.getCreatedAt())
                .build();

        return UserProfileResponse.from(userRepository.save(updated));
    }

    @Transactional
    public void changePassword(Long userId, PasswordChangeRequest request) {
        User user = findUser(userId);

        if (user.getPassword() == null) {
            throw new IllegalStateException("소셜 로그인 사용자는 비밀번호를 변경할 수 없습니다.");
        }

        if (!passwordEncoder.matches(request.currentPassword(), user.getPassword())) {
            throw new IllegalArgumentException("현재 비밀번호가 올바르지 않습니다.");
        }

        User updated = User.builder()
                .id(user.getId())
                .oauthProvider(user.getOauthProvider())
                .oauthProviderId(user.getOauthProviderId())
                .loginId(user.getLoginId())
                .password(passwordEncoder.encode(request.newPassword()))
                .name(user.getName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .birth(user.getBirth())
                .gender(user.getGender())
                .location(user.getLocation())
                .profileImageUrl(user.getProfileImageUrl())
                .role(user.getRole())
                .status(user.getStatus())
                .suspendedAt(user.getSuspendedAt())
                .suspendedUntil(user.getSuspendedUntil())
                .suspendReason(user.getSuspendReason())
                .createdAt(user.getCreatedAt())
                .build();

        userRepository.save(updated);
    }

    @Transactional
    public UserProfileResponse updateProfileImage(Long userId, MultipartFile image) {
        User user = findUser(userId);

        String imageUrl = s3Service.upload(image, "profile/" + userId);

        User updated = User.builder()
                .id(user.getId())
                .oauthProvider(user.getOauthProvider())
                .oauthProviderId(user.getOauthProviderId())
                .loginId(user.getLoginId())
                .password(user.getPassword())
                .name(user.getName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .birth(user.getBirth())
                .gender(user.getGender())
                .location(user.getLocation())
                .profileImageUrl(imageUrl)
                .role(user.getRole())
                .status(user.getStatus())
                .suspendedAt(user.getSuspendedAt())
                .suspendedUntil(user.getSuspendedUntil())
                .suspendReason(user.getSuspendReason())
                .createdAt(user.getCreatedAt())
                .build();

        return UserProfileResponse.from(userRepository.save(updated));
    }

    private User findUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("사용자를 찾을 수 없습니다."));
    }
}
