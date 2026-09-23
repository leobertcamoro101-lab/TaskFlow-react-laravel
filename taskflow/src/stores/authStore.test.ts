import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAuthStore } from './authStore';
import * as apiClient from '../api/client';
import type { User } from '../types';

// api/client.ts's request interceptor reads the token straight out of
// localStorage on every request, so the store writing/clearing it there
// (not just in memory) is the actual security-relevant behavior: it's what
// makes logout actually revoke the client's ability to authenticate, and
// what the 401 interceptor relies on being able to clear.
vi.mock('../api/client', () => ({
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
  updateProfile: vi.fn(),
  updatePassword: vi.fn(),
}));

const mockedApi = vi.mocked(apiClient);

const fakeUser: User = {
  id: 1,
  first_name: 'Ada',
  last_name: 'Lovelace',
  name: 'Ada Lovelace',
  birthday: '1990-01-01',
  gender: 'female',
  avatar: null,
  avatar_url: null,
  email: 'ada@example.com',
  email_verified_at: null,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
};

describe('authStore', () => {
  beforeEach(() => {
    localStorage.clear();
    useAuthStore.setState({ user: null, token: null, expiresAt: null, isAuthenticated: false });
    vi.clearAllMocks();
  });

  it('login stores the token in localStorage and marks the user authenticated', async () => {
    mockedApi.login.mockResolvedValue({
      data: { user: fakeUser, token: 'abc123', expires_at: null },
    } as never);

    await useAuthStore.getState().login({ email: fakeUser.email, password: 'irrelevant' });

    expect(localStorage.getItem('token')).toBe('abc123');
    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.user).toEqual(fakeUser);
  });

  it('logout clears the token from localStorage and resets auth state, even if the API call fails', async () => {
    localStorage.setItem('token', 'abc123');
    useAuthStore.setState({ user: fakeUser, token: 'abc123', expiresAt: null, isAuthenticated: true });
    mockedApi.logout.mockRejectedValue(new Error('network error'));

    await useAuthStore.getState().logout();

    expect(localStorage.getItem('token')).toBeNull();
    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
  });
});
