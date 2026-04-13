import User from '../models/User.js';
import Project from '../models/Project.js';
import { AuthRequest } from '../types/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// GET /api/dashboard/stats — admin only
export const getStats = asyncHandler<AuthRequest>(async (_req, res) => {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const [totalUsers, activeUsers, newThisWeek, totalProjects, recentUsers, recentProjects, recentActivity] =
    await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isActive: true }),
      User.countDocuments({ createdAt: { $gte: oneWeekAgo } }),
      Project.countDocuments(),
      User.find()
        .select('name email role isActive createdAt lastLogin')
        .sort({ createdAt: -1 })
        .limit(5),
      Project.find()
        .select('title status assignedTo createdAt')
        .populate('assignedTo', 'name email')
        .sort({ createdAt: -1 })
        .limit(5),
      Project.find()
        .select('title status updatedAt')
        .sort({ updatedAt: -1 })
        .limit(5),
    ]);

  res.status(200).json({
    success: true,
    message: 'Dashboard stats fetched',
    data: { totalUsers, activeUsers, newThisWeek, totalProjects, recentUsers, recentProjects, recentActivity },
  });
});

