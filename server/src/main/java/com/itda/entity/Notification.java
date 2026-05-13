package com.itda.entity;

import com.itda.enums.NotificationType;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 알림을 받을 유저
    @Column(name = "receiver_user_id", nullable = false)
    private Long receiverUserId;

    // 알림 유형
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private NotificationType type;

    // 표시할 메시지
    @Column(nullable = false, length = 500)
    private String message;

    // 관련 리소스 ID (applicationId 등)
    @Column(name = "related_id")
    private Long relatedId;

    // 읽음 여부
    @Column(name = "is_read", nullable = false)
    private boolean isRead;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.isRead = false;
    }

    public void markAsRead() {
        this.isRead = true;
    }
}
