package com.itda.dto.response;

import com.itda.entity.Resume;
import com.itda.entity.User;
import lombok.Builder;
import lombok.Getter;
import java.time.LocalDate;
import java.util.List;

// 인재 목록 카드 응답 DTO
@Getter
@Builder
public class ResumeCardResponse {

    private Long resumeId;
    private String profileImageUrl;
    private String name;
    private String gender;
    private int age;
    private boolean liked;

    // 첫 번째 경력
    private String firstCareerTitle;
    private int firstCareerYears;
    private int firstCareerMonths;

    private String location;
    private int totalHired;

    public static ResumeCardResponse of(User user, Resume resume, List<CareerResponse> careers, int totalHired, boolean liked) {
        // 나이 계산
        int age = LocalDate.now().getYear() - user.getBirth().getYear() + 1;

        // 첫 번째 경력
        CareerResponse firstCareer = careers.isEmpty() ? null : careers.get(0);

        return ResumeCardResponse.builder()
                .resumeId(resume.getId())
                .profileImageUrl(user.getProfileImageUrl())
                .name(user.getName())
                .gender(user.getGender() != null ? user.getGender().name() : null)
                .age(age)
                .firstCareerTitle(firstCareer != null ? firstCareer.getJobTitle() : null)
                .firstCareerYears(firstCareer != null ? firstCareer.getYears() : 0)
                .firstCareerMonths(firstCareer != null ? firstCareer.getMonths() : 0)
                .location(user.getLocation())
                .totalHired(totalHired)
                .liked(liked)
                .build();
    }
}