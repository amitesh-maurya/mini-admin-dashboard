import { Request } from 'express';

export type Role = 'admin' | 'user';

export interface IUser {
  _id: string;
  name: string;
  email: string;
  password?: string;
  role: Role;
  isActive: boolean;
  tokenVersion?: number;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidate: string): Promise<boolean>;
}

/** Payload stored inside access token JWT */
export interface JwtPayload {
  id: string;
  email: string;
  role: Role;
  /** Mirrors User.tokenVersion; used to verify refresh tokens haven't been revoked */
  tokenVersion: number;
  iat?: number;
  exp?: number;
}

/** Payload stored inside refresh token JWT */
export interface RefreshTokenPayload {
  id: string;
  tokenVersion: number;
  iat?: number;
  exp?: number;
}

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: Role;
    tokenVersion: number;
  };
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

export type ProjectStatus = 'pending' | 'in-progress' | 'completed' | 'on-hold';

export interface IProject {
  _id: string;
  title: string;
  description: string;
  assignedTo: string[] | Partial<IUser>[];
  status: ProjectStatus;
  createdBy: string | Partial<IUser>;
  createdAt: Date;
  updatedAt: Date;
}

export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  newThisWeek: number;
  totalProjects: number;
  recentUsers: Partial<IUser>[];
  recentProjects: Partial<IProject>[];
  recentActivity: Partial<IProject>[];
}

