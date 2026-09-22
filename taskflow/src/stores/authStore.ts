import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  login as apiLogin,
  register as apiRegister,
  logout as apiLogout,
  updateProfile as apiUpdateProfile,
  updatePassword as apiUpdatePassword,
} from '../api/client';
import type { User, RegisterPayload, LoginPayload, ProfilePayload, PasswordPayload } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  expiresAt: string | null;
  isAuthenticated: boolean;
  login: (credentials: LoginPayload) => Promise<{ user: User; token: string; expires_at: string | null }>;
  register: (credentials: RegisterPayload) => Promise<{ user: User; token: string; expires_at: string | null }>;
  logout: () => Promise<void>;
  updateProfile: (data: ProfilePayload) => Promise<User>;
  updatePassword: (data: PasswordPayload) => Promise<{ message: string }>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      expiresAt: null,
      isAuthenticated: false,

      login: async (credentials) => {
        const { data } = await apiLogin(credentials);
        localStorage.setItem('token', data.token);
        set({ user: data.user, token: data.token, expiresAt: data.expires_at, isAuthenticated: true });
        return data;
      },

      register: async (credentials) => {
        const { data } = await apiRegister(credentials);
        localStorage.setItem('token', data.token);
        set({ user: data.user, token: data.token, expiresAt: data.expires_at, isAuthenticated: true });
        return data;
      },

      logout: async () => {
        try { await apiLogout(); } catch { /* ignore */ }
        localStorage.removeItem('token');
        set({ user: null, token: null, expiresAt: null, isAuthenticated: false });
      },

      updateProfile: async (data) => {
        const { data: user } = await apiUpdateProfile(data);
        set({ user });
        return user;
      },

      updatePassword: async (data) => {
        const { data: result } = await apiUpdatePassword(data);
        return result;
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        expiresAt: state.expiresAt,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);