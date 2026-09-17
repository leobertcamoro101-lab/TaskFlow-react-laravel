export interface User {
  id: number;
  first_name: string | null;
  last_name: string | null;
  name: string;
  birthday: string | null;
  gender: string | null;
  avatar: string | null;
  avatar_url: string | null;
  email: string;
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;
}

export type TaskStatus = 'todo' | 'in-progress' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  id: number;
  user_id: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface RegisterPayload {
  first_name: string;
  last_name: string;
  birthday: string;
  gender: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface ProfilePayload {
  first_name: string;
  last_name: string;
  birthday: string;
  gender: string;
  email: string;
  avatar?: File | null;
}

export interface PasswordPayload {
  current_password: string;
  password: string;
  password_confirmation: string;
}