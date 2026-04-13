import { body } from 'express-validator';

/** Validation rules for POST /api/auth/register */
export const registerRules = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be 2–50 characters'),

  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email address required'),

  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter')
    .matches(/[0-9]/)
    .withMessage('Password must contain at least one number'),
];

/** Validation rules for POST /api/auth/login */
export const loginRules = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email address required'),

  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];
