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
    private Long userId;

    private String profileImageUrl;
    private String name;
    private String gender;
    private int age;
    private boolean liked;
    private String firstCareerTitle;
    private int firstCareerYears;
    private int firstCareerMonths;
    private String location;
    private int totalHired;

    // 고용주 본인이 작성한 리뷰 (고용주만 노출)
    private List<ReviewResponse> reviews;

    public static ResumeCardResponse of(User user, Resume resume, List<CareerResponse> careers, int totalHired, boolean liked, List<ReviewResponse> reviews) {
        int age = LocalDate.now().getYear() - user.getBirth().getYear() + 1;
        CareerResponse firstCareer = careers.isEmpty() ? null : careers.get(0);

        return ResumeCardResponse.builder()
                .resumeId(resume.getId())
                .userId(user.getId())
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
                .reviews(reviews)
                .build();
    }
}