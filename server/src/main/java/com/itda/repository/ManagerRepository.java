package com.itda.repository;

import com.itda.entity.Manager;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ManagerRepository extends JpaRepository<Manager, Long> {

    // 매니저가 관리하는 사업장 목록
    List<Manager> findByManagerUserId(Long managerUserId);

    // 사업장에 배정된 매니저 목록
    List<Manager> findByWorkplaceId(Long workplaceId);

    // 매니저가 특정 사업장 관리 권한 있는지 체크
    boolean existsByManagerUserIdAndWorkplaceId(Long managerUserId, Long workplaceId);
}