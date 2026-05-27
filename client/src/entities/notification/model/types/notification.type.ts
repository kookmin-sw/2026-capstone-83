export type NotificationType =
  | 'NEW_APPLICATION'
  | 'OFFER_RECEIVED'
  | 'OFFER_ACCEPTED'
  | 'HIRED'
  | 'REJECTED'
  | 'WORK_COMPLETED'
  | 'JOB_POST_DELETED'
  | 'AUTO_MATCHED';

export interface Notification {
  id: number;
  type: NotificationType;
  message: string;
  relatedId?: number;
  createdAt: string;
  isRead: boolean;
}
