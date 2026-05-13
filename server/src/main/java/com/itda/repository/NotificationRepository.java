package com.itda.repository;

import com.itda.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    // 유저의 미읽은 알림 목록 (최신순)
    List<Notification> findByReceiverUserIdAndIsReadFalseOrderByCreatedAtDesc(Long receiverUserId);

    // 유저의 전체 알림 목록 (최신순, 최근 50개)
    List<Notification> findTop50ByReceiverUserIdOrderByCreatedAtDesc(Long receiverUserId);

    // 미읽은 알림 개수
    long countByReceiverUserIdAndIsReadFalse(Long receiverUserId);
}
