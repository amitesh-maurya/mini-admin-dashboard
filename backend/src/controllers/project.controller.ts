import { Response } from 'express';
import { AuthRequest, ProjectStatus } from '../types/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { projectService } from '../services/project.service.js';

// GET /api/projects
export const getAllProjects = asyncHandler<AuthRequest>(async (req, res: Response) => {
  const user = req.user!;
  const result = await projectService.findProjects(req.query as Record<string, string>, user.id, user.role);

  res.status(200).json({
    success: true,
    message: 'Projects fetched',
    data: result.projects,
    pagination: result.pagination,
  });
});

// GET /api/projects/:id
export const getProjectById = asyncHandler<AuthRequest>(async (req, res: Response) => {
  const user = req.user!;
  const project = await projectService.findById(req.params.id as string, user.id, user.role);

  res.status(200).json({ success: true, message: 'Project fetched', data: project });
});

// POST /api/projects — admin only
export const createProject = asyncHandler<AuthRequest>(async (req, res: Response) => {
  const user = req.user!;
  const { title, description, assignedTo, status } = req.body as {
    title: string;
    description: string;
    assignedTo?: string[];
    status?: ProjectStatus;
  };

  const project = await projectService.createProject({ title, description, assignedTo, status }, user.id);

  res.status(201).json({ success: true, message: 'Project created', data: project });
});

// PUT /api/projects/:id — admin only
export const updateProject = asyncHandler<AuthRequest>(async (req, res: Response) => {
  const { title, description, assignedTo, status } = req.body as {
    title?: string;
    description?: string;
    assignedTo?: string[];
    status?: ProjectStatus;
  };

  const project = await projectService.updateProject(req.params.id as string, {
    title,
    description,
    assignedTo,
    status,
  });

  res.status(200).json({ success: true, message: 'Project updated', data: project });
});

// DELETE /api/projects/:id — admin only
export const deleteProject = asyncHandler<AuthRequest>(async (req, res: Response) => {
  await projectService.deleteProject(req.params.id as string);
  res.status(200).json({ success: true, message: 'Project deleted' });
});

// PATCH /api/projects/:id/assign — admin only
export const assignUsers = asyncHandler<AuthRequest>(async (req, res: Response) => {
  const { userIds } = req.body as { userIds: string[] };
  const project = await projectService.assignUsers(req.params.id as string, userIds);
  res.status(200).json({ success: true, message: 'Users assigned', data: project });
});

// PATCH /api/projects/:id/status — admin or assignee
export const updateStatus = asyncHandler<AuthRequest>(async (req, res: Response) => {
  const user = req.user!;
  const { status } = req.body as { status: ProjectStatus };
  const project = await projectService.updateStatus(req.params.id as string, status, user.id, user.role);
  res.status(200).json({ success: true, message: 'Status updated', data: project });
});
