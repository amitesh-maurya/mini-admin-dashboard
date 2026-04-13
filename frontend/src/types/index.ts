export type Role = 'admin' | 'user';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: Role;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface CreateUserPayload {
  name: string;
  email: string;
  password: string;
  role?: Role;
  isActive?: boolean;
}

export interface UpdateUserPayload {
  name?: string;
  email?: string;
  role?: Role;
  isActive?: boolean;
}

export interface ChangePasswordPayload {
  oldPassword?: string;
  newPassword: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string[];
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface UserQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: Role | '';
  isActive?: 'true' | 'false' | '';
}

export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  newThisWeek: number;
  totalProjects: number;
  recentUsers: Partial<User>[];
  recentProjects: Partial<Project>[];
  recentActivity: Partial<Project>[];
}

export type ProjectStatus = 'pending' | 'in-progress' | 'completed' | 'on-hold';

export interface Project {
  _id: string;
  title: string;
  description: string;
  assignedTo: Partial<User>[];
  status: ProjectStatus;
  createdBy: Partial<User>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectPayload {
  title: string;
  description: string;
  assignedTo?: string[];
  status?: ProjectStatus;
}

export interface UpdateProjectPayload {
  title?: string;
  description?: string;
  assignedTo?: string[];
  status?: ProjectStatus;
}

export interface ProjectQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: ProjectStatus | '';
}
