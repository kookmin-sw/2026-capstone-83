package com.itda.service;

import com.itda.dto.request.WorkplaceCreateRequest;
import com.itda.dto.request.WorkplaceUpdateRequest;
import com.itda.dto.response.WorkplaceResponse;
import com.itda.entity.Employer;
import com.itda.entity.User;
import com.itda.entity.Workplace;
import com.itda.exception.NotFoundException;
import com.itda.repository.EmployerRepository;
import com.itda.repository.JobPostRepository;
import com.itda.repository.WorkplaceRepository;
import com.itda.service.S3Service;
import org.springframework.web.multipart.MultipartFile;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class WorkplaceService {

    private final WorkplaceRepository workplaceRepository;
    private final JobPostRepository jobPostRepository;
    private final EmployerRepository employerRepository;
    private final S3Service s3Service;

    /**
     * 내 사업장 목록 조회 (로그인 사용자의 Employer 기준)
     */
    public List<WorkplaceResponse> getMyWorkplaces(User user) {
        Employer employer = getEmployerByUser(user);
        return workplaceRepository.findByEmployerId(employer.getId()).stream()
                .map(WorkplaceResponse::from)
                .toList();
    }

    /**
     * 사업장 단건 조회 (본인 소유만)
     */
    public WorkplaceResponse getWorkplace(Long workplaceId, User user) {
        Workplace workplace = findOwnedWorkplace(workplaceId, user);
        return WorkplaceResponse.from(workplace);
    }

    /**
     * 사업장 등록
     */
    @Transactional
    public WorkplaceResponse createWorkplace(WorkplaceCreateRequest request, MultipartFile companyLogoImage, User user) {
        Employer employer = getEmployerByUser(user);

        // 로고 이미지가 있으면 S3에 업로드
        String companyLogoUrl = (companyLogoImage != null && !companyLogoImage.isEmpty())
                ? s3Service.upload(companyLogoImage, "uploads/logos")
                : null;

        Workplace saved = workplaceRepository.save(Workplace.builder()
                .employer(employer)
                .name(request.name())
                .companyName(request.companyName())
                .businessNumber(request.businessNumber())
                .address(request.address())
                .companyLogoUrl(companyLogoUrl)
                .build());

        return WorkplaceResponse.from(saved);
    }

    /**
     * 사업장 수정 (부분 수정 — null 필드는 기존 값 유지)
     */
    @Transactional
    public WorkplaceResponse updateWorkplace(Long workplaceId, WorkplaceUpdateRequest request, MultipartFile companyLogoImage, User user) {
        Workplace workplace = findOwnedWorkplace(workplaceId, user);

        // 새 로고 이미지가 있으면 기존 이미지 삭제 후 새로 업로드
        String companyLogoUrl = workplace.getCompanyLogoUrl();
        if (companyLogoImage != null && !companyLogoImage.isEmpty()) {
            s3Service.delete(companyLogoUrl);
            companyLogoUrl = s3Service.upload(companyLogoImage, "uploads/logos");
        }

        Workplace updated = workplaceRepository.save(Workplace.builder()
                .id(workplace.getId())
                .employer(workplace.getEmployer())
                .name(request.name() != null ? request.name() : workplace.getName())
                .companyName(request.companyName() != null ? request.companyName() : workplace.getCompanyName())
                .businessNumber(request.businessNumber() != null ? request.businessNumber() : workplace.getBusinessNumber())
                .address(request.address() != null ? request.address() : workplace.getAddress())
                .companyLogoUrl(companyLogoUrl)
                .createdAt(workplace.getCreatedAt())
                .build());

        return WorkplaceResponse.from(updated);
    }

    /**
     * 사업장 삭제
     * - 본인 소유 사업장만 삭제 가능 (소유자 검증)
     * - 사업장에 연결된 공고가 1건이라도 있으면 삭제 차단 (FK 위반 방지)
     */
    @Transactional
    public void deleteWorkplace(Long workplaceId, User user) {
        Workplace workplace = findOwnedWorkplace(workplaceId, user);

        long jobPostCount = jobPostRepository.countByWorkplaceId(workplaceId);
        if (jobPostCount > 0) {
            throw new IllegalStateException(
                    "연결된 공고가 존재하므로 사업장을 삭제할 수 없습니다. 먼저 공고를 정리해주세요.");
        }

        workplaceRepository.delete(workplace);
    }

    // ─── 내부 헬퍼 ─────────────────────────────────────────────

    private Employer getEmployerByUser(User user) {
        return employerRepository.findByUserId(user.getId())
                .orElseThrow(() -> new NotFoundException(
                        "고용주 정보가 없습니다. 고용주 회원만 사업장을 관리할 수 있습니다."));
    }

    private Workplace findOwnedWorkplace(Long workplaceId, User user) {
        Workplace workplace = workplaceRepository.findById(workplaceId)
                .orElseThrow(() -> new NotFoundException("사업장을 찾을 수 없습니다."));

        Long ownerUserId = workplace.getEmployer().getUser().getId();
        if (!ownerUserId.equals(user.getId())) {
            throw new AccessDeniedException("본인 소유 사업장만 접근할 수 있습니다.");
        }
        return workplace;
    }
    // 사업장 존재 여부 확인
    public boolean hasWorkplace(User user) {
        Employer employer = employerRepository.findByUserId(user.getId())
                .orElse(null);
        if (employer == null) return false;
        return !workplaceRepository.findByEmployerId(employer.getId()).isEmpty();
    }
}