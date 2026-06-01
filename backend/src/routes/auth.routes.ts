import { Router } from 'express';
import authController from '../modules/auth/auth.controller';
import { authMiddleware } from '../middleware/authMiddleware';
import rateLimit from 'express-rate-limit';

// Rate limit: 10 login attempts per 15 minutes per IP
const loginRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: {
        success: false,
        message: 'Too many login attempts. Please try again in 15 minutes.',
    },
    standardHeaders: true,
    legacyHeaders: false,
});

const router = Router();

router.post('/login', loginRateLimiter, authController.login.bind(authController));
router.post('/logout', authController.logout.bind(authController));
router.get('/me', authMiddleware, authController.me.bind(authController));

export default router;