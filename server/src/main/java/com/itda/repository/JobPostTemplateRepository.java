package com.itda.repository;

import com.itda.entity.JobPostTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface JobPostTemplateRepository extends JpaRepository<JobPostTemplate, Long> {

    List<JobPostTemplate> findByEmployerIdOrderByUpdatedAtDesc(Long employerId);

    Optional<JobPostTemplate> findByIdAndEmployerId(Long id, Long employerId);
}
