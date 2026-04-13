import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthRequest, Role } from '../types/index.js';
import { verifyAccessToken } from '../utils/token.js';

// Authenticate: reads JWT from Authorization header (Bearer) first, then httpOnly cookie.
// The header approach is required for cross-origin deployments (e.g. Vercel + Render)
// where browsers block third-party httpOnly cookies.
export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  // Prefer Authorization header (cross-origin friendly)
  const authHeader = req.headers.authorization;
  let token: string | undefined;

  if (authHeader?.startsWith('Bearer ')) {
    token = authHeader.slice(7);
  } else {
    // Fallback to httpOnly cookie (same-origin / local dev)
    token = req.cookies?.accessToken;
  }

  if (!token) {
    res.status(401).json({ success: false, message: 'Not authenticated. Please log in.' });
    return;
  }

  try {
    const decoded = verifyAccessToken(token);
    req.user = { id: decoded.id, email: decoded.email, role: decoded.role as Role, tokenVersion: decoded.tokenVersion };
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ success: false, message: 'Session expired. Please log in again.' });
      return;
    }
    res.status(401).json({ success: false, message: 'Invalid token. Please log in.' });
  }
};

// isAdmin: must be called after authenticate
export const isAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Not authenticated.' });
    return;
  }
  if (req.user.role !== 'admin') {
    res.status(403).json({ success: false, message: 'Admin access required.' });
    return;
  }
  next();
};

// isSelfOrAdmin: user can access their own resource, admin can access any
export const isSelfOrAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Not authenticated.' });
    return;
  }
  if (req.user.role === 'admin' || req.user.id === req.params.id) {
    next();
    return;
  }
  res.status(403).json({ success: false, message: 'Access denied.' });
};
