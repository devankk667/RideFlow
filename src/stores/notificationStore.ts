import { create } from 'zustand';
import type { Notification } from '../types';
import { notifications as mockNotifications } from '../data/mockData';

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  getUserNotifications: (userId: string) => Notification[];
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [...mockNotifications],
  unreadCount: mockNotifications.filter(n => !n.isRead).length,

  addNotification: (data) => {
    const newNotification: Notification = {
      ...data,
      id: `notif_${Date.now()}${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
    };

    set((state) => ({
      notifications: [newNotification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    }));
  },

  markAsRead: (notificationId) => {
    set((state) => {
      const notification = state.notifications.find(n => n.id === notificationId);
      if (!notification || notification.isRead) return state;

      return {
        notifications: state.notifications.map((n) =>
          n.id === notificationId ? { ...n, isRead: true } : n
        ),
        unreadCount: state.unreadCount - 1,
      };
    });
  },

  markAllAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
      unreadCount: 0,
    }));
  },

  getUserNotifications: (userId) => {
    return get().notifications.filter((n) => n.userId === userId);
  },
}));
