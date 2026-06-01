import { Router } from 'express';
import rackRoutes from './rack.routes';
import equipmentRoutes from './equipment.routes';
import authRoutes from './auth.routes';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// Public — no auth required
router.use('/auth', authRoutes);

// Protected — all routes below require valid JWT cookie
router.use('/racks', authMiddleware, rackRoutes);
router.use('/equipment', authMiddleware, equipmentRoutes);

export default router;