import toast from 'react-hot-toast';
import { createElement } from 'react';
import { useNotificationStore } from 'entities/notification/model/store/notificationStore';
import type { Notification } from 'entities/notification/model/types/notification.type';
import { CustomToast } from 'shared/ui/Toast/CustomToast';

/**
 * 실시간 알림 수신 시 호출
 * - store에 알림 추가
 * - 커스텀 토스트 표시 (타입별 아이콘 + 색상)
 */
export const showNotificationToast = (notification: Notification) => {
  useNotificationStore.getState().addNotification(notification);

  toast.custom(
    (t) => createElement(CustomToast, { t, notification }),
    { duration: 4000 },
  );
};
