import express from 'express';
import {register, login, logout, getCurrentUser, refreshToken} from '../controllers/authController';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

router.post('/register', register);

router.post('/login', login);

router.post('/logout', logout)

router.post('/refreshToken', refreshToken)

router.get('/me', authMiddleware, getCurrentUser);

export default router; 