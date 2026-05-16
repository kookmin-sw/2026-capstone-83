package com.itda.repository;

import com.itda.entity.JobPostClickLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface JobPostClickLogRepository extends JpaRepository<JobPostClickLog, Long> {
}
