import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../services/api';

interface User {
  _id: string;
  name: string;
  username?: string;
  email: string;
  token: string;
  avatar?: string;
  tier: 'FREE' | 'PRO' | 'ENTERPRISE';
  usedStorage: number;
  storageLimit: number;
  isTwoFactorEnabled?: boolean;
  isAdmin?: boolean;
}

interface AuthState {
  user: User | null;
  error: string | null;
  setUser: (user: User | null) => void;
  updateProfile: (data: Partial<User> | FormData) => Promise<void>;
  fetchProfile: () => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      error: null,
      setUser: (user) => set({ user, error: null }),
      clearError: () => set({ error: null }),
  updateProfile: async (data) => {
    try {
        set({ error: null });
        const isFormData = data instanceof FormData;
        // Use relative path 'auth/profile' instead of '/auth/profile' 
        // to ensure it appends correctly to baseURL (which ends in /api)
        const { data: updatedUser } = await api.put('auth/profile', data, {
            headers: isFormData ? {} : { 'Content-Type': 'application/json' }
        });
        set({ user: updatedUser });
    } catch (error: any) {
        console.error('Error updating profile:', error);
        set({ error: error?.response?.data?.message || 'Failed to update profile' });
        throw error;
    }
  },
      fetchProfile: async () => {
        try {
            set({ error: null });
            const { data: userProfile } = await api.get('auth/profile');
            const currentUser = get().user;
            if (currentUser) {
                set({ user: { ...currentUser, ...userProfile } });
            }
        } catch (error: any) {
            console.error('Error fetching profile:', error);
            set({ error: error?.response?.data?.message || 'Failed to fetch profile' });
        }
      },
      logout: () => set({ user: null, error: null }),
    }),
    {
      name: 'auth-storage',
    }
  )
);
