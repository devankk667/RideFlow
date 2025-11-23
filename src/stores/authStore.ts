import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, Passenger, Driver, Admin } from '../types';
import { allUsers } from '../data/mockData';
import { API_URL } from '../config/api';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: any) => Promise<boolean>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: async (email, password) => {
        try {
          const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          });

          const data = await response.json();

          if (response.ok) {
            set({ user: data.user, token: data.token, isAuthenticated: true });
            return true;
          }
          return false;
        } catch (error) {
          console.error('Login error:', error);
          return false;
        }
      },

      register: async (userData) => {
        try {
          console.log('Sending registration request:', userData);
          const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData),
          });

          console.log('Registration response status:', response.status);
          const data = await response.json();
          console.log('Registration response data:', data);

          if (response.ok) {
            set({ user: data.user, token: data.token, isAuthenticated: true });
            return true;
          }
          console.error('Registration failed:', data);
          return false;
        } catch (error) {
          console.error('Register error:', error);
          return false;
        }
      },

      logout: () => {
        set({ user: null, token: null, isAuthenticated: false });
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
