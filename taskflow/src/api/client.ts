import axios, { type AxiosResponse } from 'axios';
import type {
  User, Task, TaskStatus, TaskPriority,
  RegisterPayload, LoginPayload, ProfilePayload, PasswordPayload,
} from '../types';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

interface AuthResponse {
  user: User;
  token: string;
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
export const updateProfile = (data: ProfilePayload): Promise<AxiosResponse<User>> => api.put('/profile', data);
export const updatePassword = (data: PasswordPayload): Promise<AxiosResponse<MessageResponse>> => api.put('/profile/password', data);

// Tasks
export const getTasks = (params?: TaskFilters): Promise<AxiosResponse<Task[]>> => api.get('/tasks', { params });
export const createTask = (data: TaskInput): Promise<AxiosResponse<Task>> => api.post('/tasks', data);
export const updateTask = (id: number, data: Partial<TaskInput>): Promise<AxiosResponse<Task>> => api.put(`/tasks/${id}`, data);
export const deleteTask = (id: number): Promise<AxiosResponse<MessageResponse>> => api.delete(`/tasks/${id}`);

export default api;