package com.itda.repository;

import com.itda.dto.request.JobPostFilterRequest;
import com.itda.entity.JobPost;

import java.util.List;

/**
 * JobPost 동적 필터 조회 — Spring Data JPA 명명 규약에 따른 Custom 인터페이스.
 * 구현체({@link JobPostRepositoryImpl})에서 EntityManager 기반 동적 JPQL을 생성한다.
 */
public interface JobPostRepositoryCustom {

    /**
     * 다중 태그 + 범위 조건을 모두 받아 OPEN 상태 공고를 동적으로 필터링한다.
     * 커서(req.cursor()) 기반 페이지네이션 — fetchSize = size + 1 개 가져와
     * 호출자가 hasNext 를 판단한다.
     */
    List<JobPost> findByDynamicFilter(JobPostFilterRequest req, int fetchSize);
}
