import { Router } from 'express';
import {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  assignUsers,
  updateStatus,
} from '../controllers/project.controller.js';
import { authenticate, isAdmin } from '../middleware/auth.middleware.js';
import {
  projectIdParamRule,
  createProjectRules,
  updateProjectRules,
  updateStatusRules,
  assignUsersRules,
} from '../validations/project.validation.js';

const router = Router();

// All project routes require authentication
router.use(authenticate);

// GET /api/projects — role-filtered in service layer
router.get('/', getAllProjects);

// POST /api/projects — admin only
router.post('/', isAdmin, createProjectRules, createProject);

// GET /api/projects/:id — admin: any; user: only assigned
router.get('/:id', projectIdParamRule, getProjectById);

// PUT /api/projects/:id — admin only
router.put('/:id', isAdmin, updateProjectRules, updateProject);

// DELETE /api/projects/:id — admin only
router.delete('/:id', isAdmin, projectIdParamRule, deleteProject);

// PATCH /api/projects/:id/assign — admin only
router.patch('/:id/assign', isAdmin, assignUsersRules, assignUsers);

// PATCH /api/projects/:id/status — admin or assignee (checked in service)
router.patch('/:id/status', updateStatusRules, updateStatus);

export default router;
