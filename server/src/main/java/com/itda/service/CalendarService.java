package com.itda.service;

import com.itda.dto.request.ScheduleRequest;
import com.itda.dto.response.calendar.EmployerScheduleItem;
import com.itda.dto.response.calendar.EmployerScheduleResponse;
import com.itda.entity.JobPost;
import com.itda.repository.ApplicationRepository;
import com.itda.repository.JobPostRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CalendarService {

    private final JobPostRepository jobPostRepository;
    private final ApplicationRepository applicationRepository;

    /**
     * 고용자 캘린더 일정 조회
     * 해당 기간 내 고용자가 등록한 공고를 workDate 기준으로 그룹핑하여 반환
     */
    public EmployerScheduleResponse getEmployerSchedules(Long employerId, ScheduleRequest request) {
        List<JobPost> jobPosts = jobPostRepository.findByEmployerIdAndWorkDateBetween(
                employerId, request.startDate(), request.endDate());

        Map<LocalDate, List<EmployerScheduleItem>> schedules = jobPosts.stream()
                .collect(Collectors.groupingBy(
                        JobPost::getWorkDate,
                        Collectors.mapping(
                                jobPost -> {
                                    int applicantCount = applicationRepository.findByJobPostId(jobPost.getId()).size();
                                    return EmployerScheduleItem.from(jobPost, applicantCount);
                                },
                                Collectors.toList()
                        )
                ));

        return EmployerScheduleResponse.of(request.startDate(), request.endDate(), schedules);
    }
}
