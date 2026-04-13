import api from '@/lib/api';
import {
  ApiResponse,
  PaginatedResponse,
  User,
  CreateUserPayload,
  UpdateUserPayload,
  ChangePasswordPayload,
  UserQueryParams,
  DashboardStats,
  Role,
} from '@/types';

export const userService = {
  async getUsers(params: UserQueryParams = {}): Promise<PaginatedResponse<User>> {
    const { data } = await api.get<PaginatedResponse<User>>('/users', { params });
    return data;
  },

  async getUserById(id: string): Promise<ApiResponse<User>> {
    const { data } = await api.get<ApiResponse<User>>(`/users/${id}`);
    return data;
  },

  async createUser(payload: CreateUserPayload): Promise<ApiResponse<User>> {
    const { data } = await api.post<ApiResponse<User>>('/users', payload);
    return data;
  },

  async updateUser(id: string, payload: UpdateUserPayload): Promise<ApiResponse<User>> {
    const { data } = await api.put<ApiResponse<User>>(`/users/${id}`, payload);
    return data;
  },

  async deleteUser(id: string): Promise<ApiResponse> {
    const { data } = await api.delete<ApiResponse>(`/users/${id}`);
    return data;
  },

  async changeRole(id: string, role: Role): Promise<ApiResponse<User>> {
    const { data } = await api.patch<ApiResponse<User>>(`/users/${id}/role`, { role });
    return data;
  },

  async changePassword(id: string, payload: ChangePasswordPayload): Promise<ApiResponse> {
    const { data } = await api.patch<ApiResponse>(`/users/${id}/password`, payload);
    return data;
  },

  async getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
    const { data } = await api.get<ApiResponse<DashboardStats>>('/dashboard/stats');
    return data;
  },
};
