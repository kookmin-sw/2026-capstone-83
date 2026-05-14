package com.itda.dto.response;

import com.itda.entity.Career;
import com.itda.entity.Resume;
import com.itda.entity.User;
import lombok.Builder;
import lombok.Getter;
import java.util.List;

@Getter
@Builder
public class ResumeResponse {

    // ── 회원 정보 (users 테이블) ──
    private String name;
    private String gender;
    private String birthdate;
    private String address;
    private String phone;
    private String email;
    private String profileImageUrl;

    // ── 이력서 정보 (resumes 테이블) ──
    private String education;
    private String educationStatus;
    private String major;

    // ── 경력 목록 (careers 테이블) ──
    private List<CareerResponse> careers;

    // ── 자격/인증 목록 (certificates 테이블) ──
    private List<CertificateResponse> certificates;

    // ── 누적 채용 횟수 (applications 테이블에서 계산) ──
    private int totalHired;

    public static ResumeResponse of(User user, Resume resume,
                                    List<CareerResponse> careers,
                                    List<CertificateResponse> certificates,
                                    int totalHired) {
        return ResumeResponse.builder()
                .name(user.getName())
                .gender(user.getGender() != null ? user.getGender().toString() : null)
                .birthdate(user.getBirth() != null ? user.getBirth().toString() : null)
                .address(user.getLocation())
                .phone(user.getPhone())
                .email(user.getEmail())
                .profileImageUrl(user.getProfileImageUrl())
                .education(resume != null && resume.getEducation() != null ? resume.getEducation().name() : null)
                .educationStatus(resume != null && resume.getEducationStatus() != null ? resume.getEducationStatus().name() : null)
                .major(resume != null ? resume.getMajor() : null)
                .careers(careers)
                .certificates(certificates) // 자격/인증 목록 추가
                .totalHired(totalHired)
                .build();
    }
}