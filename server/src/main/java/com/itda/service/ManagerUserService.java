package com.itda.service;

import com.itda.dto.request.SuspendRequest;
import com.itda.dto.response.ManagerUserResponse;
import com.itda.entity.User;
import com.itda.enums.ApplicationStatus;
import com.itda.enums.UserRole;
import com.itda.enums.UserStatus;
import com.itda.exception.NotFoundException;
import com.itda.repository.ApplicationRepository;
import com.itda.repository.ReportRepository;
import com.itda.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ManagerUserService {

    private final UserRepository userRepository;
    private final ReportRepository reportRepository;
    private final ApplicationRepository applicationRepository;

    /**
     * 회원 목록 검색 (이름/이메일, 역할, 상태 필터)
     */
    public Page<ManagerUserResponse> searchUsers(String keyword, UserRole role, UserStatus status, int page, int size) {
        Page<User> users = userRepository.searchUsers(keyword, role, status, PageRequest.of(page, size));
        return users.map(this::toManagerUserResponse);
    }

    /**
     * 회원 상세 조회
     */
    public ManagerUserResponse getUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("유저를 찾을 수 없습니다."));
        return toManagerUserResponse(user);
    }

    /**
     * 회원 정지 처리
     */
    @Transactional
    public ManagerUserResponse suspendUser(Long userId, SuspendRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("유저를 찾을 수 없습니다."));

        user.suspend(request.days(), request.reason());
        userRepository.save(user);
        return toManagerUserResponse(user);
    }

    /**
     * 회원 정지 해제
     */
    @Transactional
    public ManagerUserResponse activateUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("유저를 찾을 수 없습니다."));

        user.activate();
        userRepository.save(user);
        return toManagerUserResponse(user);
    }

    /**
     * 스케줄러: 정지 기간 만료된 유저 자동 해제 (1분마다)
     */
    @Scheduled(fixedRate = 60000)
    @Transactional
    public void autoActivateExpiredSuspensions() {
        List<User> expired = userRepository.findByStatusAndSuspendedUntilBefore(
                UserStatus.SUSPENDED, LocalDateTime.now());
        expired.forEach(User::activate);
        userRepository.saveAll(expired);
    }

    // ─── 내부 헬퍼 ───────────────────────────────────────────

    private ManagerUserResponse toManagerUserResponse(User user) {
        long reportCount = reportRepository.countByTargetId(user.getId());
        long matchCount = applicationRepository.countByApplicantUserIdAndStatusIn(
                user.getId(), List.of(ApplicationStatus.HIRED, ApplicationStatus.COMPLETED));
        return ManagerUserResponse.from(user, reportCount, matchCount);
    }
}
