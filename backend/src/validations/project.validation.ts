import { body, param } from 'express-validator';
import { validate } from '../middleware/validate.middleware.js';

const STATUS_VALUES = ['pending', 'in-progress', 'completed', 'on-hold'] as const;

export const projectIdParamRule = [
  param('id').isMongoId().withMessage('Invalid project ID'),
  validate,
];

export const createProjectRules = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ min: 3, max: 100 }).withMessage('Title must be 3–100 characters'),
  body('description')
    .trim()
    .notEmpty().withMessage('Description is required')
    .isLength({ min: 10, max: 500 }).withMessage('Description must be 10–500 characters'),
  body('status')
    .optional()
    .isIn(STATUS_VALUES).withMessage('Invalid status value'),
  body('assignedTo')
    .optional()
    .isArray().withMessage('assignedTo must be an array')
    .custom((arr: unknown[]) => arr.every((id) => typeof id === 'string' && /^[a-fA-F0-9]{24}$/.test(id)))
    .withMessage('All assignedTo values must be valid MongoDB IDs'),
  validate,
];

export const updateProjectRules = [
  param('id').isMongoId().withMessage('Invalid project ID'),
  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 }).withMessage('Title must be 3–100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 10, max: 500 }).withMessage('Description must be 10–500 characters'),
  body('status')
    .optional()
    .isIn(STATUS_VALUES).withMessage('Invalid status value'),
  body('assignedTo')
    .optional()
    .isArray().withMessage('assignedTo must be an array')
    .custom((arr: unknown[]) => arr.every((id) => typeof id === 'string' && /^[a-fA-F0-9]{24}$/.test(id)))
    .withMessage('All assignedTo values must be valid MongoDB IDs'),
  validate,
];

export const updateStatusRules = [
  param('id').isMongoId().withMessage('Invalid project ID'),
  body('status')
    .notEmpty().withMessage('Status is required')
    .isIn(STATUS_VALUES).withMessage('Invalid status value'),
  validate,
];

export const assignUsersRules = [
  param('id').isMongoId().withMessage('Invalid project ID'),
  body('userIds')
    .isArray({ min: 0 }).withMessage('userIds must be an array')
    .custom((arr: unknown[]) => arr.every((id) => typeof id === 'string' && /^[a-fA-F0-9]{24}$/.test(id)))
    .withMessage('All userIds must be valid MongoDB IDs'),
  validate,
];
