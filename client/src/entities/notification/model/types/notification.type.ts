export type NotificationType = 'APPLY' | 'ACCEPT' | 'WORK_COMPLETE' | 'SYSTEM';

export interface Notification {
  id: number;
  type: NotificationType;
  message: string;
  createdAt: string;
  isRead: boolean;
}
