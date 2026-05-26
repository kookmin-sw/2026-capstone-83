package com.itda.service;

import com.itda.dto.request.JobPostTemplateRequest;
import com.itda.dto.response.JobPostTemplateResponse;
import com.itda.entity.Employer;
import com.itda.entity.JobPostTemplate;
import com.itda.entity.User;
import com.itda.enums.WageType;
import com.itda.exception.NotFoundException;
import com.itda.repository.EmployerRepository;
import com.itda.repository.JobPostTemplateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class JobPostTemplateService {

    private final JobPostTemplateRepository templateRepository;
    private final EmployerRepository employerRepository;

    public List<JobPostTemplateResponse> getMyTemplates(User user) {
        Employer employer = getEmployer(user);
        return templateRepository.findByEmployerIdOrderByUpdatedAtDesc(employer.getId())
                .stream()
                .map(JobPostTemplateResponse::from)
                .toList();
    }

    public JobPostTemplateResponse getTemplate(User user, Long templateId) {
        Employer employer = getEmployer(user);
        JobPostTemplate template = templateRepository.findByIdAndEmployerId(templateId, employer.getId())
                .orElseThrow(() -> new NotFoundException("템플릿을 찾을 수 없습니다."));
        return JobPostTemplateResponse.from(template);
    }

    @Transactional
    public JobPostTemplateResponse createTemplate(User user, JobPostTemplateRequest request) {
        Employer employer = getEmployer(user);

        JobPostTemplate template = JobPostTemplate.builder()
                .employer(employer)
                .templateName(request.templateName())
                .title(request.title())
                .jobCategory(request.jobCategory())
                .jobSubcategory(request.jobSubcategory())
                .wage(request.wage())
                .wageType(request.wageType() != null ? WageType.valueOf(request.wageType()) : null)
                .workStart(request.workStart() != null ? LocalTime.parse(request.workStart()) : null)
                .workEnd(request.workEnd() != null ? LocalTime.parse(request.workEnd()) : null)
                .totalSlots(request.totalSlots())
                .description(request.description())
                .requirements(request.requirements())
                .benefits(request.benefits())
                .tasks(request.tasks())
                .items(request.items())
                .urgentEnabled(request.urgentEnabled() != null ? request.urgentEnabled() : false)
                .urgentWageIncrease(request.urgentWageIncrease())
                .autoOfferEnabled(request.autoOfferEnabled() != null ? request.autoOfferEnabled() : false)
                .build();

        return JobPostTemplateResponse.from(templateRepository.save(template));
    }

    @Transactional
    public JobPostTemplateResponse updateTemplate(User user, Long templateId, JobPostTemplateRequest request) {
        Employer employer = getEmployer(user);
        JobPostTemplate template = templateRepository.findByIdAndEmployerId(templateId, employer.getId())
                .orElseThrow(() -> new NotFoundException("템플릿을 찾을 수 없습니다."));

        template.setTemplateName(request.templateName());
        template.setTitle(request.title());
        template.setJobCategory(request.jobCategory());
        template.setJobSubcategory(request.jobSubcategory());
        template.setWage(request.wage());
        template.setWageType(request.wageType() != null ? WageType.valueOf(request.wageType()) : null);
        template.setWorkStart(request.workStart() != null ? LocalTime.parse(request.workStart()) : null);
        template.setWorkEnd(request.workEnd() != null ? LocalTime.parse(request.workEnd()) : null);
        template.setTotalSlots(request.totalSlots());
        template.setDescription(request.description());
        template.setRequirements(request.requirements());
        template.setBenefits(request.benefits());
        template.setTasks(request.tasks());
        template.setItems(request.items());
        template.setUrgentEnabled(request.urgentEnabled() != null ? request.urgentEnabled() : false);
        template.setUrgentWageIncrease(request.urgentWageIncrease());
        template.setAutoOfferEnabled(request.autoOfferEnabled() != null ? request.autoOfferEnabled() : false);

        return JobPostTemplateResponse.from(template);
    }

    @Transactional
    public void deleteTemplate(User user, Long templateId) {
        Employer employer = getEmployer(user);
        JobPostTemplate template = templateRepository.findByIdAndEmployerId(templateId, employer.getId())
                .orElseThrow(() -> new NotFoundException("템플릿을 찾을 수 없습니다."));
        templateRepository.delete(template);
    }

    private Employer getEmployer(User user) {
        return employerRepository.findByUserId(user.getId())
                .orElseThrow(() -> new NotFoundException("고용주 정보를 찾을 수 없습니다."));
    }
}
