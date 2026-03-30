import { create } from 'zustand';
import Pusher from 'pusher-js';
import toast from 'react-hot-toast';

interface Notification {
  id: string;
  message: string;
  type: 'UPLOAD' | 'DOWNLOAD' | 'SYSTEM';
  createdAt: Date;
  read: boolean;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  pusher: Pusher | null;
  initPusher: (userId?: string) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => void;
  markAsRead: (id: string) => void;
  clearNotifications: () => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  pusher: null,

  initPusher: (userId) => {
    if (get().pusher) return;

    const pusherKey = import.meta.env.VITE_PUSHER_KEY;
    const pusherCluster = import.meta.env.VITE_PUSHER_CLUSTER;

    if (!pusherKey || !pusherCluster) {
      console.warn('Pusher keys missing. Neural real-time sync disabled.');
      return;
    }

    const pusher = new Pusher(pusherKey, {
      cluster: pusherCluster,
    });

    if (userId) {
      const channel = pusher.subscribe(`user-${userId}`);
      
      channel.bind('notification', (data: { message: string }) => {
        get().addNotification({
          message: data.message,
          type: 'DOWNLOAD',
        });
        toast.success(data.message, {
          icon: '🔔',
          duration: 5000,
        });
      });
    }

    set({ pusher });
  },

  addNotification: (notification) => {
    const newNotification: Notification = {
      ...notification,
      id: Math.random().toString(36).substring(7),
      createdAt: new Date(),
      read: false,
    };

    set((state) => ({
      notifications: [newNotification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    }));
  },

  markAsRead: (id) => {
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
      unreadCount: Math.max(0, state.unreadCount - 1),
    }));
  },

  clearNotifications: () => {
    set({ notifications: [], unreadCount: 0 });
  },
}));
