import api from '@/lib/api';
import {
  ApiResponse,
  PaginatedResponse,
  Project,
  CreateProjectPayload,
  UpdateProjectPayload,
  ProjectQueryParams,
  ProjectStatus,
} from '@/types';

export const projectService = {
  async getProjects(params: ProjectQueryParams = {}): Promise<PaginatedResponse<Project>> {
    const { data } = await api.get<PaginatedResponse<Project>>('/projects', { params });
    return data;
  },

  async getProjectById(id: string): Promise<ApiResponse<Project>> {
    const { data } = await api.get<ApiResponse<Project>>(`/projects/${id}`);
    return data;
  },

  async createProject(payload: CreateProjectPayload): Promise<ApiResponse<Project>> {
    const { data } = await api.post<ApiResponse<Project>>('/projects', payload);
    return data;
  },

  async updateProject(id: string, payload: UpdateProjectPayload): Promise<ApiResponse<Project>> {
    const { data } = await api.put<ApiResponse<Project>>(`/projects/${id}`, payload);
    return data;
  },

  async deleteProject(id: string): Promise<ApiResponse> {
    const { data } = await api.delete<ApiResponse>(`/projects/${id}`);
    return data;
  },

  async assignUsers(id: string, userIds: string[]): Promise<ApiResponse<Project>> {
    const { data } = await api.patch<ApiResponse<Project>>(`/projects/${id}/assign`, { userIds });
    return data;
  },

  async updateStatus(id: string, status: ProjectStatus): Promise<ApiResponse<Project>> {
    const { data } = await api.patch<ApiResponse<Project>>(`/projects/${id}/status`, { status });
    return data;
  },
};
