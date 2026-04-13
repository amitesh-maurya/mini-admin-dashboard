import { body, param, query } from 'express-validator';

/** Validate MongoDB ObjectId in route params */
export const idParamRule = [
  param('id').isMongoId().withMessage('Invalid user ID format'),
];

/** Validation rules for GET /api/users (query params) */
export const getUsersQueryRules = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('limit must be between 1 and 50'),

  query('role')
    .optional()
    .isIn(['admin', 'user', ''])
    .withMessage('role must be admin or user'),

  query('isActive')
    .optional()
    .isIn(['true', 'false', ''])
    .withMessage('isActive must be true or false'),
];

/** Validation rules for POST /api/users (admin creates user) */
export const createUserRules = [
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

  body('role')
    .optional()
    .isIn(['admin', 'user'])
    .withMessage('Role must be admin or user'),

  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
];

/** Validation rules for PUT /api/users/:id */
export const updateUserRules = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be 2–50 characters'),

  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email address required'),

  body('role')
    .optional()
    .isIn(['admin', 'user'])
    .withMessage('Role must be admin or user'),

  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
];

/** Validation rules for PATCH /api/users/:id/role */
export const changeRoleRules = [
  body('role')
    .isIn(['admin', 'user'])
    .withMessage('Role must be admin or user'),
];

/** Validation rules for PATCH /api/users/:id/password */
export const changePasswordRules = [
  body('oldPassword')
    .optional()
    .notEmpty()
    .withMessage('Old password must not be empty if provided'),

  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters')
    .matches(/[A-Z]/)
    .withMessage('New password must contain at least one uppercase letter')
    .matches(/[0-9]/)
    .withMessage('New password must contain at least one number'),
];
