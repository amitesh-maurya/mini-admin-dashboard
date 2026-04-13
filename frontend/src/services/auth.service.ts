import api from '@/lib/api';
import { ApiResponse, User, LoginPayload, RegisterPayload } from '@/types';

export const authService = {
  async login(payload: LoginPayload): Promise<ApiResponse<User>> {
    const { data } = await api.post<ApiResponse<User>>('/auth/login', payload);
    return data;
  },

  async register(payload: RegisterPayload): Promise<ApiResponse<User>> {
    const { data } = await api.post<ApiResponse<User>>('/auth/register', payload);
    return data;
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout');
  },

  async getMe(): Promise<ApiResponse<User>> {
    const { data } = await api.get<ApiResponse<User>>('/auth/me');
    return data;
  },
};
