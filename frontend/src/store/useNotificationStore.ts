import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';
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
  socket: Socket | null;
  initSocket: (userId?: string) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => void;
  markAsRead: (id: string) => void;
  clearNotifications: () => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  socket: null,

  initSocket: (userId) => {
    if (get().socket) return;

    const hostname = window.location.hostname;
    const SOCKET_URL = import.meta.env.VITE_API_URL 
      ? import.meta.env.VITE_API_URL.replace('/api', '') 
      : `http://${hostname}:8000`;

    const socket = io(SOCKET_URL);

    socket.on('connect', () => {
      console.log('Socket connected');
      if (userId) {
        socket.emit('join', userId);
      }
    });

    socket.on('notification', (data: { message: string }) => {
      get().addNotification({
        message: data.message,
        type: 'DOWNLOAD',
      });
      toast.success(data.message, {
        icon: '🔔',
        duration: 5000,
      });
    });

    set({ socket });
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
