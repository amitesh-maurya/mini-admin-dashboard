import { Router } from 'express';
import { register, login, logout, getMe, refresh } from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { registerRules, loginRules } from '../validations/auth.validation.js';

const router = Router();

router.post('/register', registerRules, validate, register);
router.post('/login', loginRules, validate, login);
router.post('/refresh', refresh);            // no auth cookie needed — uses refreshToken cookie
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, getMe);

export default router;
