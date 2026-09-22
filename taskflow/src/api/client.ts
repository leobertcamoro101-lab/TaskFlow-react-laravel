import axios, { type AxiosResponse } from 'axios';
import type {
  User, Task, TaskStatus, TaskPriority,
  RegisterPayload, LoginPayload, ProfilePayload, PasswordPayload, ForgotPasswordPayload,
  ResetPasswordPayload
} from '../types';
import { notifyLoadingStart, notifyLoadingStop } from '../context/loading-bridge'; // loading-bridge

// Lets a request opt out of the global loading indicator — used by the
// background session-expiry ping so it doesn't flash the spinner on every check.
declare module 'axios' {
  export interface AxiosRequestConfig {
    silent?: boolean;
  }
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

api.interceptors.request.use((config) => {
  if (!config.silent) notifyLoadingStart();
  return config;
});

api.interceptors.response.use(
  (response) => {
    if (!response.config.silent) notifyLoadingStop();
    return response;
  },
  (error) => {
    if (!error.config?.silent) notifyLoadingStop();

    // Token missing/expired/revoked — clear stale auth state and send the user back to login
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('auth-storage');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  },
);
// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
interface AuthResponse {
  user: User;
  token: string;
  expires_at: string | null;
}

interface MessageResponse {
  message: string;
}

export interface TaskFilters {
  status?: TaskStatus | 'all';
  priority?: TaskPriority;
}

export interface TaskInput {
  title: string;
  description?: string | null;
  status?: TaskStatus;
  priority?: TaskPriority;
  due_date?: string | null;
}

// Auth
export const register = (data: RegisterPayload): Promise<AxiosResponse<AuthResponse>> => api.post('/register', data);
export const login = (data: LoginPayload): Promise<AxiosResponse<AuthResponse>> => api.post('/login', data);
export const logout = (): Promise<AxiosResponse<MessageResponse>> => api.post('/logout');
export const getMe = (): Promise<AxiosResponse<User>> => api.get('/me');
// Background session-liveness check used by useSessionWatcher — same endpoint as
// getMe, marked silent so it doesn't trigger the global loading indicator.
export const pingSession = (): Promise<AxiosResponse<User>> => api.get('/me', { silent: true });
export const updateProfile = (data: ProfilePayload): Promise<AxiosResponse<User>> => {
  if (data.avatar) {
    const formData = new FormData();
    formData.append('first_name', data.first_name);
    formData.append('last_name', data.last_name);
    formData.append('birthday', data.birthday);
    formData.append('gender', data.gender);
    formData.append('email', data.email);
    formData.append('avatar', data.avatar);
    formData.append('_method', 'PUT');
    return api.post('/profile', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  }
  return api.put('/profile', data);
};
export const updatePassword = (data: PasswordPayload): Promise<AxiosResponse<MessageResponse>> => api.put('/profile/password', data);

// Tasks
export const getTasks = (params?: TaskFilters): Promise<AxiosResponse<Task[]>> => api.get('/tasks', { params });
export const createTask = (data: TaskInput): Promise<AxiosResponse<Task>> => api.post('/tasks', data);
export const updateTask = (id: number, data: Partial<TaskInput>): Promise<AxiosResponse<Task>> => api.put(`/tasks/${id}`, data);
export const deleteTask = (id: number): Promise<AxiosResponse<MessageResponse>> => api.delete(`/tasks/${id}`);
export const forgotPassword = (data: ForgotPasswordPayload): Promise<AxiosResponse<MessageResponse>> =>
  api.post('/forgot-password', data);
export const resetPassword = (data: ResetPasswordPayload): Promise<AxiosResponse<MessageResponse>> =>
  api.post('/reset-password', data);

export default api;