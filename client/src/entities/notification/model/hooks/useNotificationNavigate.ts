import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from 'entities/auth/model/store/authStore';
import { getNotificationNavigatePath } from '../../lib/getNotificationNavigatePath';
import { useNotificationStore } from '../store/notificationStore';
import type { Notification } from '../types/notification.type';

/** 알림 클릭: 읽음 처리 후 타입·역할에 맞는 페이지로 이동 */
export const useNotificationNavigate = () => {
  const navigate = useNavigate();
  const role = useAuthStore((s) => s.role);
  const markAsRead = useNotificationStore((s) => s.markAsRead);

  const handleNotificationClick = useCallback(
    (notification: Notification, options?: { onAfterNavigate?: () => void }) => {
      markAsRead(notification.id);
      navigate(getNotificationNavigatePath(notification.type, role));
      options?.onAfterNavigate?.();
    },
    [markAsRead, navigate, role],
  );

  return { handleNotificationClick };
};
