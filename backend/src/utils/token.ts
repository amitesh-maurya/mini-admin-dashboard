import jwt from 'jsonwebtoken';
import { Response } from 'express';

const IS_PROD = process.env.NODE_ENV === 'production';

const ACCESS_SECRET = process.env.JWT_SECRET as string;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET as string;
const ACCESS_EXPIRES = process.env.JWT_EXPIRES_IN || '15m';
const REFRESH_EXPIRES = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

// ─── Token Payload Types ──────────────────────────────────────────────────────

export interface AccessTokenPayload {
  id: string;
  email: string;
  role: string;
  /** Matches User.tokenVersion; incremented on logout/password change */
  tokenVersion: number;
}

export interface RefreshTokenPayload {
  id: string;
  tokenVersion: number;
}

// ─── Token Generators ─────────────────────────────────────────────────────────

export const generateAccessToken = (payload: AccessTokenPayload): string =>
  jwt.sign(payload, ACCESS_SECRET, { expiresIn: ACCESS_EXPIRES } as jwt.SignOptions);

export const generateRefreshToken = (payload: RefreshTokenPayload): string =>
  jwt.sign(payload, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRES } as jwt.SignOptions);

// ─── Cookie Helpers ───────────────────────────────────────────────────────────

/** Sets both accessToken and refreshToken httpOnly cookies. */
export const setAuthCookies = (
  res: Response,
  accessToken: string,
  refreshToken: string,
): void => {
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: IS_PROD,
    sameSite: 'lax',
    maxAge: 15 * 60 * 1000, // 15 minutes
    path: '/',
  });

  // Scope the refresh token cookie to only the refresh endpoint for extra safety
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: IS_PROD,
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/api/auth/refresh',
  });
};

/** Clears both auth cookies (must use same options as when they were set). */
export const clearAuthCookies = (res: Response): void => {
  res.clearCookie('accessToken', {
    httpOnly: true,
    secure: IS_PROD,
    sameSite: 'lax',
    path: '/',
  });
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: IS_PROD,
    sameSite: 'lax',
    path: '/api/auth/refresh',
  });
};

/** Verifies an access token. Throws if invalid or expired. */
export const verifyAccessToken = (token: string): AccessTokenPayload =>
  jwt.verify(token, ACCESS_SECRET) as AccessTokenPayload;

/** Verifies a refresh token. Throws if invalid or expired. */
export const verifyRefreshToken = (token: string): RefreshTokenPayload =>
  jwt.verify(token, REFRESH_SECRET) as RefreshTokenPayload;
