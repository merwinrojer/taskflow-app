import {apiClient} from './client';
import type {User} from '../types';

interface AuthResponse {
  token: string;
  user: User;
}

export const authApi = {
  async register(email: string, password: string): Promise<AuthResponse> {
    const {data} = await apiClient.post<AuthResponse>('/auth/register', {
      email,
      password,
    });
    return data;
  },
  async login(email: string, password: string): Promise<AuthResponse> {
    const {data} = await apiClient.post<AuthResponse>('/auth/login', {
      email,
      password,
    });
    return data;
  },
  async me(): Promise<User> {
    const {data} = await apiClient.get<{user: User}>('/auth/me');
    return data.user;
  },
};
