import express from 'express';
import { register, login, getCurrentUser, getManagers } from '../controllers/authController';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

router.post('/register', register);

router.post('/login', login);

router.get('/me', authMiddleware, getCurrentUser);

router.get('/managers', getManagers);

export default router; 