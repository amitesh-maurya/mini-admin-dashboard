import { Router } from 'express';
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  changeRole,
  changePassword,
} from '../controllers/user.controller.js';
import { authenticate, isAdmin, isSelfOrAdmin } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import {
  idParamRule,
  getUsersQueryRules,
  createUserRules,
  updateUserRules,
  changeRoleRules,
  changePasswordRules,
} from '../validations/user.validation.js';

const router = Router();

// All user routes require authentication
router.use(authenticate);

router.get('/', isAdmin, getUsersQueryRules, validate, getAllUsers);
router.post('/', isAdmin, createUserRules, validate, createUser);

router.get('/:id', idParamRule, validate, isSelfOrAdmin, getUserById);
router.put('/:id', idParamRule, validate, isSelfOrAdmin, updateUserRules, validate, updateUser);
router.delete('/:id', idParamRule, validate, isAdmin, deleteUser);

router.patch('/:id/role', idParamRule, validate, isAdmin, changeRoleRules, validate, changeRole);
router.patch('/:id/password', idParamRule, validate, isSelfOrAdmin, changePasswordRules, validate, changePassword);

export default router;
