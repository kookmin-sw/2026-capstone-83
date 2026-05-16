package com.itda.repository;

import com.itda.entity.JobPostImpressionLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface JobPostImpressionLogRepository extends JpaRepository<JobPostImpressionLog, Long> {
}
