import { authClient } from 'shared/api/httpClient';
import type { Notification } from '../model/types/notification.type';

/** 전체 알림 목록 조회 (최근 50개) */
export const fetchNotifications = async (): Promise<Notification[]> => {
  const response = await authClient.get<Notification[]>('/api/v1/notifications');
  return response.data;
};

/** 미읽은 알림 목록 조회 */
export const fetchUnreadNotifications = async (): Promise<Notification[]> => {
  const response = await authClient.get<Notification[]>('/api/v1/notifications/unread');
  return response.data;
};

/** 미읽은 알림 개수 조회 */
export const fetchUnreadCount = async (): Promise<number> => {
  const response = await authClient.get<{ count: number }>('/api/v1/notifications/unread-count');
  return response.data.count;
};

/** 개별 알림 읽음 처리 */
export const markNotificationAsRead = async (id: number): Promise<void> => {
  await authClient.patch(`/api/v1/notifications/${id}/read`);
};

/** 전체 알림 읽음 처리 */
export const markAllNotificationsAsRead = async (): Promise<void> => {
  await authClient.patch('/api/v1/notifications/read-all');
};

/** SSE 연결용 단기 토큰 발급 */
export const issueSseToken = async (): Promise<string> => {
  const response = await authClient.post<{ sseToken: string }>('/api/v1/notifications/token');
  return response.data.sseToken;
};
