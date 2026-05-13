package com.itda.dto.response;

import com.itda.entity.Notification;
import com.itda.enums.NotificationType;

import java.time.LocalDateTime;

public record NotificationResponse(
        Long id,
        NotificationType type,
        String message,
        Long relatedId,
        boolean isRead,
        LocalDateTime createdAt
) {
    public static NotificationResponse from(Notification notification) {
        return new NotificationResponse(
                notification.getId(),
                notification.getType(),
                notification.getMessage(),
                notification.getRelatedId(),
                notification.isRead(),
                notification.getCreatedAt()
        );
    }
}
