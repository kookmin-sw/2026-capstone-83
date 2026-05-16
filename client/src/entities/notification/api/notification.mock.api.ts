import type { Notification } from '../model/types/notification.type';
import mockNotificationData from 'shared/mocks/data/mockNotificationData.json';

// mock API
export const fetchMockNotifications = (): Promise<Notification[]> => {
  return new Promise((resolve) => {
    resolve(mockNotificationData as Notification[]);
  });
};
