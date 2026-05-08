package com.itda.service;

import com.itda.dto.request.WorkplaceCreateRequest;
import com.itda.dto.response.WorkplaceResponse;
import com.itda.entity.Employer;
import com.itda.entity.User;
import com.itda.entity.Workplace;
import com.itda.exception.NotFoundException;
import com.itda.repository.EmployerRepository;
import com.itda.repository.WorkplaceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * 사업장(Workplace) 관련 비즈니스 로직.
 *
 * 모든 메서드는 로그인한 User(EMPLOYER)를 기준으로 동작한다.
 * Employer 식별은 user_id 기반으로 처리하므로 호출 측은 항상 인증된 User를 넘겨야 한다.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class WorkplaceService {

    private final WorkplaceRepository workplaceRepository;
    private final EmployerRepository employerRepository;

    /**
     * 로그인한 EMPLOYER에 소속된 새 사업장 생성.
     */
    @Transactional
    public WorkplaceResponse createMyWorkplace(User user, WorkplaceCreateRequest request) {
        Employer employer = getEmployerOf(user);

        Workplace workplace = Workplace.builder()
                .employer(employer)
                .name(request.name())
                .companyName(request.companyName())
                .businessNumber(request.businessNumber())
                .address(request.address())
                .companyLogoUrl(request.companyLogoUrl())
                .build();

        return WorkplaceResponse.from(workplaceRepository.save(workplace));
    }

    /**
     * 로그인한 EMPLOYER가 소유한 사업장 목록 조회.
     */
    public List<WorkplaceResponse> getMyWorkplaces(User user) {
        Employer employer = getEmployerOf(user);
        return workplaceRepository.findByEmployerId(employer.getId()).stream()
                .map(WorkplaceResponse::from)
                .toList();
    }

    /**
     * 단일 사업장 조회 — 본인 소유만 허용.
     */
    public WorkplaceResponse getMyWorkplace(User user, Long workplaceId) {
        Employer employer = getEmployerOf(user);
        Workplace workplace = workplaceRepository.findById(workplaceId)
                .orElseThrow(() -> new NotFoundException("사업장을 찾을 수 없습니다."));

        if (!workplace.getEmployer().getId().equals(employer.getId())) {
            throw new SecurityException("본인 소유의 사업장이 아닙니다.");
        }
        return WorkplaceResponse.from(workplace);
    }

    /**
     * 다른 서비스에서 소유권 검증을 위해 재사용할 수 있는 헬퍼.
     * workplaceId가 user의 employer 소유인지 확인 후, Workplace 엔티티를 반환한다.
     * 권한 위반 시 SecurityException 발생.
     */
    public Workplace getOwnedWorkplace(User user, Long workplaceId) {
        Employer employer = getEmployerOf(user);
        Workplace workplace = workplaceRepository.findById(workplaceId)
                .orElseThrow(() -> new NotFoundException("사업장을 찾을 수 없습니다."));

        if (!workplace.getEmployer().getId().equals(employer.getId())) {
            throw new SecurityException("본인 소유의 사업장이 아닙니다.");
        }
        return workplace;
    }

    private Employer getEmployerOf(User user) {
        return employerRepository.findByUserId(user.getId())
                .orElseThrow(() -> new NotFoundException("고용주 정보를 찾을 수 없습니다."));
    }
}
