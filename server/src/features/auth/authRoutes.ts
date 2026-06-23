import { Router } from 'express';
import { authController } from './authController';

const router = Router();

// POST /api/auth/login
router.post('/login', authController.login);

export default router;
