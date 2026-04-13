import { Response } from 'express';
import jwt from 'jsonwebtoken';
import { AuthRequest, RefreshTokenPayload } from '../types/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/AppError.js';
import {
  generateAccessToken,
  generateRefreshToken,
  setAuthCookies,
  clearAuthCookies,
  verifyRefreshToken,
} from '../utils/token.js';
import { authService } from '../services/auth.service.js';
import User from '../models/User.js';

/** Issues access + refresh tokens, sets cookies, and returns the access token for
 *  cross-origin clients that cannot rely on httpOnly cookies (e.g. Vercel + Render). */
const issueTokens = (
  res: Response,
  user: { _id: unknown; email: string; role: string; tokenVersion: number },
): string => {
  const id = String(user._id);
  const accessToken = generateAccessToken({
    id,
    email: user.email,
    role: user.role,
    tokenVersion: user.tokenVersion,
  });
  const refreshToken = generateRefreshToken({ id, tokenVersion: user.tokenVersion });
  setAuthCookies(res, accessToken, refreshToken);
  return accessToken;
};

// ─── POST /api/auth/register ────────────────────────────────────────────────
export const register = asyncHandler<AuthRequest>(async (req, res) => {
  const { name, email, password } = req.body;
  const user = await authService.register(name, email, password);

  const accessToken = issueTokens(res, {
    _id: user._id,
    email: user.email,
    role: user.role,
    tokenVersion: user.tokenVersion ?? 0,
  });

  res.status(201).json({
    success: true,
    message: 'Registration successful',
    accessToken,
    data: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
    },
  });
});

// ─── POST /api/auth/login ────────────────────────────────────────────────────
export const login = asyncHandler<AuthRequest>(async (req, res) => {
  const { email, password } = req.body;
  const user = await authService.login(email, password);

  const accessToken = issueTokens(res, {
    _id: user._id,
    email: user.email,
    role: user.role,
    tokenVersion: user.tokenVersion ?? 0,
  });

  res.status(200).json({
    success: true,
    message: 'Login successful',
    accessToken,
    data: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      lastLogin: user.lastLogin,
    },
  });
});

// ─── POST /api/auth/refresh ──────────────────────────────────────────────────
// Issues a new accessToken when the refreshToken is valid and tokenVersion matches.
export const refresh = asyncHandler<AuthRequest>(async (req, res) => {
  const token: string | undefined = req.cookies?.refreshToken;
  if (!token) throw new AppError('No refresh token provided', 401);

  let decoded: RefreshTokenPayload;
  try {
    decoded = verifyRefreshToken(token);
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      throw new AppError('Refresh token expired. Please log in again.', 401);
    }
    throw new AppError('Invalid refresh token.', 401);
  }

  // DB lookup validates that the session has not been revoked via tokenVersion
  const user = await User.findById(decoded.id).select('+tokenVersion');
  if (!user) throw new AppError('User not found', 401);
  if (user.tokenVersion !== decoded.tokenVersion) {
    throw new AppError('Session revoked. Please log in again.', 401);
  }
  if (!user.isActive) throw new AppError('Account is deactivated.', 403);

  const newAccessToken = generateAccessToken({
    id: String(user._id),
    email: user.email,
    role: user.role,
    tokenVersion: user.tokenVersion,
  });

  const isProd = process.env.NODE_ENV === 'production';

  res.cookie('accessToken', newAccessToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    maxAge: 15 * 60 * 1000,
    path: '/',
  });

  // Also return the token in the body so cross-origin clients can update their stored token
  res.status(200).json({ success: true, message: 'Token refreshed', accessToken: newAccessToken });
});

// ─── POST /api/auth/logout ───────────────────────────────────────────────────
export const logout = asyncHandler<AuthRequest>(async (req, res) => {
  // Increment tokenVersion → invalidates all outstanding refresh tokens for this user
  if (req.user?.id) {
    await User.findByIdAndUpdate(req.user.id, { $inc: { tokenVersion: 1 } });
  }
  clearAuthCookies(res);
  res.status(200).json({ success: true, message: 'Logged out successfully' });
});

// ─── GET /api/auth/me ────────────────────────────────────────────────────────
export const getMe = asyncHandler<AuthRequest>(async (req, res) => {
  const user = await authService.findById(req.user!.id);
  if (!user) throw new AppError('User not found', 404);
  res.status(200).json({ success: true, message: 'User fetched', data: user });
});

