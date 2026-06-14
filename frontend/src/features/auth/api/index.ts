import { apiClient } from '@/api/client';
import type { User, ApiResponse } from '@/types/index';

interface LoginRequest {
  username: string;
  password: string;
}

export const authApi = {
  login: (data: LoginRequest) =>
    apiClient.post<ApiResponse<User>>('/auth/login', data, {
      credentials: 'include',
    }),

  logout: () =>
    apiClient.post<ApiResponse<void>>('/auth/logout', undefined, {
      credentials: 'include',
    }),

  getCurrentUser: () =>
    apiClient.get<ApiResponse<User>>('/auth/me', {
      credentials: 'include',
    }),
};
