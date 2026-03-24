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
  setUser: (user: User | null) => void;
  updateProfile: (data: any) => Promise<void>;
  fetchProfile: () => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      setUser: (user) => set({ user }),
  updateProfile: async (data) => {
    try {
        const isFormData = data instanceof FormData;
        // Use relative path 'auth/profile' instead of '/auth/profile' 
        // to ensure it appends correctly to baseURL (which ends in /api)
        const { data: updatedUser } = await api.put('auth/profile', data, {
            headers: isFormData ? {} : { 'Content-Type': 'application/json' }
        });
        set({ user: updatedUser });
    } catch (error) {
        console.error('Error updating profile:', error);
        throw error;
    }
  },
      fetchProfile: async () => {
        try {
            const { data: userProfile } = await api.get('auth/profile');
            const currentUser = get().user;
            if (currentUser) {
                set({ user: { ...currentUser, ...userProfile } });
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
        }
      },
      logout: () => set({ user: null }),
    }),
    {
      name: 'auth-storage',
    }
  )
);
