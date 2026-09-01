import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { login as apiLogin, register as apiRegister, logout as apiLogout } from '../api/client';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: async (credentials) => {
        const { data } = await apiLogin(credentials);
        localStorage.setItem('token', data.token);
        set({ user: data.user, token: data.token, isAuthenticated: true });
        return data;
      },

      register: async (credentials) => {
        const { data } = await apiRegister(credentials);
        localStorage.setItem('token', data.token);
        set({ user: data.user, token: data.token, isAuthenticated: true });
        return data;
      },

      logout: async () => {
        try { await apiLogout(); } catch {}
        localStorage.removeItem('token');
        set({ user: null, token: null, isAuthenticated: false });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, token: state.token, isAuthenticated: state.isAuthenticated }),
    }
  )
);
