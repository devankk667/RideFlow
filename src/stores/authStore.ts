import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, Passenger, Driver, Admin } from '../types';
import { allUsers } from '../data/mockData';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      login: (email: string, password: string) => {
        const user = allUsers.find(
          (u) => u.email === email && u.password === password
        );

        if (user) {
          set({ user, isAuthenticated: true });
          return true;
        }
        return false;
      },

      logout: () => {
        set({ user: null, isAuthenticated: false });
      },

      updateProfile: (data) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...data } : null,
        }));
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);

// Helper to get typed user
export const usePassenger = () => {
  const user = useAuthStore((state) => state.user);
  return user?.role === 'passenger' ? (user as Passenger) : null;
};

export const useDriver = () => {
  const user = useAuthStore((state) => state.user);
  return user?.role === 'driver' ? (user as Driver) : null;
};

export const useAdmin = () => {
  const user = useAuthStore((state) => state.user);
  return user?.role === 'admin' ? (user as Admin) : null;
};
