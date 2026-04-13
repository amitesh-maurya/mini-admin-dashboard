import User, { IUserDocument } from '../models/User.js';
import { AppError } from '../utils/AppError.js';

/**
 * AuthService — all authentication business logic lives here.
 * Controllers stay thin; this layer is independently testable.
 */
export const authService = {
  /**
   * Register a new user (role always defaults to 'user').
   * Throws 409 if email is already taken.
   */
  async register(
    name: string,
    email: string,
    password: string,
  ): Promise<IUserDocument> {
    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) throw new AppError('Email already registered', 409);

    return User.create({ name, email, password, role: 'user' });
  },

  /**
   * Validate credentials and update lastLogin.
   * Always throws 401 for wrong email OR wrong password (enumeration defense).
   */
  async login(email: string, password: string): Promise<IUserDocument> {
    // findByEmail is a static that selects +password
    const user = await (User as any).findByEmail(email) as IUserDocument | null;

    if (!user) throw new AppError('Invalid email or password', 401);
    if (!user.isActive)
      throw new AppError('Account is deactivated. Contact an administrator.', 403);

    const isMatch = await user.comparePassword(password);
    if (!isMatch) throw new AppError('Invalid email or password', 401);

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    return user;
  },

  /**
   * Return user without password (used by /me endpoint).
   * Returns null if not found.
   */
  async findById(id: string): Promise<IUserDocument | null> {
    return User.findById(id).select('-password');
  },
};
