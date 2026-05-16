export type NotificationType =
  | 'NEW_APPLICATION'
  | 'OFFER_RECEIVED'
  | 'OFFER_ACCEPTED'
  | 'HIRED'
  | 'REJECTED'
  | 'WORK_COMPLETED';

export interface Notification {
  id: number;
  type: NotificationType;
  message: string;
  relatedId?: number;
  createdAt: string;
  isRead: boolean;
}
