import mongoose from 'mongoose';
import Project from '../models/Project.js';
import { AppError } from '../utils/AppError.js';
import { ProjectStatus } from '../types/index.js';

export interface FindProjectsParams {
  page?: string;
  limit?: string;
  status?: string;
  search?: string;
}

export const projectService = {
  async findProjects(params: FindProjectsParams, requesterId: string, requesterRole: string) {
    const page = Math.max(1, parseInt(params.page ?? '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(params.limit ?? '10', 10)));
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {};

    // Users only see their assigned projects
    if (requesterRole !== 'admin') {
      filter.assignedTo = new mongoose.Types.ObjectId(requesterId);
    }

    if (params.status) filter.status = params.status;
    if (params.search) {
      filter.$or = [
        { title: { $regex: params.search, $options: 'i' } },
        { description: { $regex: params.search, $options: 'i' } },
      ];
    }

    const [projects, total] = await Promise.all([
      Project.find(filter)
        .populate('assignedTo', 'name email')
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Project.countDocuments(filter),
    ]);

    return {
      projects,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  },

  async findById(id: string, requesterId: string, requesterRole: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) throw new AppError('Invalid project ID', 400);

    const project = await Project.findById(id)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email');

    if (!project) throw new AppError('Project not found', 404);

    // Non-admins can only view projects they are assigned to
    if (requesterRole !== 'admin') {
      const assignedIds = project.assignedTo.map((u) => u.toString());
      if (!assignedIds.includes(requesterId)) {
        throw new AppError('Access denied', 403);
      }
    }

    return project;
  },

  async createProject(
    data: { title: string; description: string; assignedTo?: string[]; status?: ProjectStatus },
    createdBy: string
  ) {
    const project = await Project.create({ ...data, createdBy });
    return project.populate(['assignedTo', 'createdBy']);
  },

  async updateProject(
    id: string,
    updates: { title?: string; description?: string; assignedTo?: string[]; status?: ProjectStatus }
  ) {
    if (!mongoose.Types.ObjectId.isValid(id)) throw new AppError('Invalid project ID', 400);

    const project = await Project.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    })
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email');

    if (!project) throw new AppError('Project not found', 404);
    return project;
  },

  async deleteProject(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) throw new AppError('Invalid project ID', 400);

    const project = await Project.findByIdAndDelete(id);
    if (!project) throw new AppError('Project not found', 404);
  },

  async assignUsers(id: string, userIds: string[]) {
    if (!mongoose.Types.ObjectId.isValid(id)) throw new AppError('Invalid project ID', 400);

    const project = await Project.findByIdAndUpdate(
      id,
      { assignedTo: userIds },
      { new: true, runValidators: true }
    )
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email');

    if (!project) throw new AppError('Project not found', 404);
    return project;
  },

  async updateStatus(id: string, status: ProjectStatus, requesterId: string, requesterRole: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) throw new AppError('Invalid project ID', 400);

    const existing = await Project.findById(id);
    if (!existing) throw new AppError('Project not found', 404);

    // Non-admins can only update status if they are assignees
    if (requesterRole !== 'admin') {
      const assignedIds = existing.assignedTo.map((u) => u.toString());
      if (!assignedIds.includes(requesterId)) {
        throw new AppError('Access denied: you are not assigned to this project', 403);
      }
    }

    existing.status = status;
    await existing.save();

    return existing.populate(['assignedTo', 'createdBy']);
  },
};
