import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchNotifications,
  fetchUnreadNotifications,
  fetchUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from '../api/notification.api';

const NOTIFICATION_KEYS = {
  all: ['notifications'] as const,
  unread: ['notifications', 'unread'] as const,
  unreadCount: ['notifications', 'unread-count'] as const,
};

/** 전체 알림 목록 조회 */
export const useNotifications = () => {
  return useQuery({
    queryKey: NOTIFICATION_KEYS.all,
    queryFn: fetchNotifications,
  });
};

/** 미읽은 알림 목록 조회 */
export const useUnreadNotifications = () => {
  return useQuery({
    queryKey: NOTIFICATION_KEYS.unread,
    queryFn: fetchUnreadNotifications,
  });
};

/** 미읽은 알림 개수 */
export const useUnreadCount = () => {
  return useQuery({
    queryKey: NOTIFICATION_KEYS.unreadCount,
    queryFn: fetchUnreadCount,
  });
};

/** 개별 알림 읽음 처리 */
export const useMarkAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markNotificationAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.all });
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.unread });
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.unreadCount });
    },
  });
};

/** 전체 읽음 처리 */
export const useMarkAllAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markAllNotificationsAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.all });
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.unread });
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.unreadCount });
    },
  });
};
