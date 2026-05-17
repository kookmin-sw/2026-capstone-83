import { create } from 'zustand';
import type { Notification } from '../types/notification.type';
import { markNotificationAsRead, markAllNotificationsAsRead } from '../../api/notification.api';

interface NotificationState {
  notifications: Notification[];
  setNotifications: (notifications: Notification[]) => void;
  markAllAsRead: () => void;
  markAsRead: (id: number) => void;
  addNotification: (notification: Notification) => void;
  unreadCount: () => number;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  setNotifications: (notifications) => set({ notifications }),
  markAllAsRead: () => {
    // 즉시 UI 반영
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
    }));
    // 서버에도 반영
    markAllNotificationsAsRead().catch(() => { });
  },
  markAsRead: (id) => {
    // 즉시 UI 반영
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, isRead: true } : n
      ),
    }));
    // 서버에도 반영
    markNotificationAsRead(id).catch(() => { });
  },
  addNotification: (notification) =>
    set((state) => ({
      notifications: [notification, ...state.notifications],
    })),
  unreadCount: () => get().notifications.filter((n) => !n.isRead).length,
}));
