import { Router } from 'express';
import { getStats } from '../controllers/dashboard.controller.js';
import { authenticate, isAdmin } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/stats', authenticate, isAdmin, getStats);

export default router;
