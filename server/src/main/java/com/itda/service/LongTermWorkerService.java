package com.itda.service;

import com.itda.entity.LongTermWorker;
import com.itda.entity.User;
import com.itda.exception.NotFoundException;
import com.itda.repository.LongTermWorkerRepository;
import com.itda.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class LongTermWorkerService {

    private final LongTermWorkerRepository longTermWorkerRepository;
    private final UserRepository userRepository;

    // 장기근무 토글 (고용주)
    @Transactional
    public boolean toggleLongTermWorker(Long applicantUserId, User employerUser) {
        User applicant = userRepository.findById(applicantUserId)
                .orElseThrow(() -> new NotFoundException("사용자를 찾을 수 없습니다."));

        Optional<LongTermWorker> existing = longTermWorkerRepository
                .findByEmployerUserIdAndApplicantUserId(employerUser.getId(), applicantUserId);

        if (existing.isPresent()) {
            longTermWorkerRepository.delete(existing.get());
            return false; // 장기근무 해제
        }

        longTermWorkerRepository.save(LongTermWorker.builder()
                .employerUser(employerUser)
                .applicantUser(applicant)
                .build());
        return true; // 장기근무 등록
    }

    // 장기근무 여부 확인
    public boolean isLongTermWorker(Long employerUserId, Long applicantUserId) {
        return longTermWorkerRepository
                .existsByEmployerUserIdAndApplicantUserId(employerUserId, applicantUserId);
    }

    // 고용주가 장기근무로 등록한 구직자 ID 목록
    public java.util.List<Long> getLongTermWorkerIds(Long employerUserId) {
        return longTermWorkerRepository.findByEmployerUserId(employerUserId)
                .stream().map(l -> l.getApplicantUser().getId()).toList();
    }
}