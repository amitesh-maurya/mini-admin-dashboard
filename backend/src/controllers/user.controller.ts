import { Response } from 'express';
import { AuthRequest } from '../types/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/AppError.js';
import { userService } from '../services/user.service.js';

// GET /api/users — admin only, paginated + search + filter
export const getAllUsers = asyncHandler<AuthRequest>(async (req, res) => {
  const pageNum = Math.max(1, parseInt(req.query.page as string ?? '1') || 1);
  const limitNum = Math.min(50, Math.max(1, parseInt(req.query.limit as string ?? '10') || 10));

  const result = await userService.findUsers({
    page: req.query.page as string,
    limit: req.query.limit as string,
    search: req.query.search as string,
    role: req.query.role as string,
    isActive: req.query.isActive as string,
  });

  res.status(200).json({
    success: true,
    message: 'Users fetched',
    data: result.users,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total: result.total,
      totalPages: result.totalPages,
    },
  });
});

// GET /api/users/:id — admin or self
export const getUserById = asyncHandler<AuthRequest>(async (req, res) => {
  const user = await userService.findById(req.params.id as string);
  if (!user) throw new AppError('User not found', 404);
  res.status(200).json({ success: true, message: 'User fetched', data: user });
});

// POST /api/users — admin only
export const createUser = asyncHandler<AuthRequest>(async (req, res) => {
  const { name, email, password, role, isActive } = req.body;
  const user = await userService.createUser({ name, email, password, role, isActive });
  res.status(201).json({ success: true, message: 'User created', data: user });
});

// PUT /api/users/:id — admin can change anything; self can change name only
export const updateUser = asyncHandler<AuthRequest>(async (req, res) => {
  const isAdmin = req.user?.role === 'admin';
  const allowedFields: string[] = isAdmin ? ['name', 'email', 'role', 'isActive'] : ['name', 'email'];

  const updates: Record<string, unknown> = {};
  for (const field of allowedFields) {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  }

  if (Object.keys(updates).length === 0) {
    throw new AppError('No valid fields to update', 400);
  }

  const user = await userService.updateUser(req.params.id as string, updates);
  res.status(200).json({ success: true, message: 'User updated', data: user });
});

// DELETE /api/users/:id — admin only, prevent self-deletion
export const deleteUser = asyncHandler<AuthRequest>(async (req, res) => {
  await userService.deleteUser(req.params.id as string, req.user!.id);
  res.status(200).json({ success: true, message: 'User deleted' });
});

// PATCH /api/users/:id/role — admin only
export const changeRole = asyncHandler<AuthRequest>(async (req, res) => {
  const user = await userService.changeRole(req.params.id as string, req.body.role);
  res.status(200).json({ success: true, message: 'Role updated', data: user });
});

// PATCH /api/users/:id/password — admin or self
export const changePassword = asyncHandler<AuthRequest>(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  await userService.changePassword(
    req.params.id as string,
    oldPassword,
    newPassword,
    req.user!.id,
    req.user!.role,
  );
  res.status(200).json({ success: true, message: 'Password changed successfully' });
});



