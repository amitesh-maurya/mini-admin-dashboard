import User, { IUserDocument } from '../models/User.js';
import { AppError } from '../utils/AppError.js';

interface FindUsersParams {
  page?: string;
  limit?: string;
  search?: string;
  role?: string;
  isActive?: string;
}

interface FindUsersResult {
  users: IUserDocument[];
  total: number;
  totalPages: number;
}

/**
 * UserService — CRUD business logic separated from the HTTP layer.
 */
export const userService = {
  /** Paginated user list with optional search / role / isActive filters. */
  async findUsers(params: FindUsersParams): Promise<FindUsersResult> {
    const page = Math.max(1, parseInt(params.page ?? '1') || 1);
    const limit = Math.min(50, Math.max(1, parseInt(params.limit ?? '10') || 10));
    const { search = '', role = '', isActive = '' } = params;
    const filter: Record<string, unknown> = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }
    if (role && ['admin', 'user'].includes(role)) filter.role = role;
    if (isActive === 'true') filter.isActive = true;
    if (isActive === 'false') filter.isActive = false;

    const [users, total] = await Promise.all([
      User.find(filter)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      User.countDocuments(filter),
    ]);

    return { users, total, totalPages: Math.ceil(total / limit) };
  },

  /** Single user by ID, without password. Returns null if not found. */
  async findById(id: string): Promise<IUserDocument | null> {
    return User.findById(id).select('-password');
  },

  /**
   * Create a user (admin-facing). Throws 409 if email taken.
   * Returns the saved user object with password omitted.
   */
  async createUser(data: {
    name: string;
    email: string;
    password: string;
    role?: string;
    isActive?: boolean;
  }): Promise<Record<string, unknown>> {
    const exists = await User.findOne({ email: data.email.toLowerCase() });
    if (exists) throw new AppError('Email already registered', 409);

    const user = await User.create({
      name: data.name,
      email: data.email,
      password: data.password,
      role: data.role || 'user',
      isActive: data.isActive !== undefined ? data.isActive : true,
    });

    const userObj = user.toObject() as unknown as Record<string, unknown>;
    delete userObj.password;
    return userObj;
  },

  /**
   * Update allowed fields on a user.
   * Throws 404 if user not found.
   */
  async updateUser(
    id: string,
    updates: Record<string, unknown>,
  ): Promise<IUserDocument> {
    const user = await User.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    }).select('-password');

    if (!user) throw new AppError('User not found', 404);
    return user;
  },

  /**
   * Delete a user by ID.
   * Throws 400 if admin tries to delete themselves.
   * Throws 404 if user not found.
   */
  async deleteUser(id: string, requesterId: string): Promise<void> {
    if (id === requesterId)
      throw new AppError('You cannot delete your own account', 400);

    const user = await User.findByIdAndDelete(id);
    if (!user) throw new AppError('User not found', 404);
  },

  /**
   * Change a user's role.
   * Throws 404 if user not found.
   */
  async changeRole(id: string, role: string): Promise<IUserDocument> {
    const user = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true },
    ).select('-password');

    if (!user) throw new AppError('User not found', 404);
    return user;
  },

  /**
   * Change a user's password.
   * - Non-admins MUST supply oldPassword.
   * - Admins changing THEIR OWN password must also supply oldPassword.
   * - Admins changing OTHER users' passwords skip the old password check.
   * Increments tokenVersion to invalidate all existing refresh tokens.
   */
  async changePassword(
    id: string,
    oldPassword: string | undefined,
    newPassword: string,
    requesterId: string,
    requesterRole: string,
  ): Promise<void> {
    const user = await User.findById(id).select('+password +tokenVersion');
    if (!user) throw new AppError('User not found', 404);

    const isSelf = id === requesterId;
    const isAdminChangingOther = requesterRole === 'admin' && !isSelf;

    // Admins changing OTHER users' passwords skip the old-password check
    if (!isAdminChangingOther) {
      if (!oldPassword)
        throw new AppError('Current password is required', 400);

      const isMatch = await user.comparePassword(oldPassword);
      if (!isMatch) throw new AppError('Current password is incorrect', 401);
    }

    user.password = newPassword;
    // Invalidate all existing refresh tokens for this user
    user.tokenVersion = (user.tokenVersion ?? 0) + 1;
    await user.save();
  },
};
