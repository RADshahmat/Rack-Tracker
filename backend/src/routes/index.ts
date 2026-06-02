import { Router } from 'express';
import rackRoutes from './rack.routes';
import equipmentRoutes from './equipment.routes';
import authRoutes from './auth.routes';
import { authMiddleware } from '../middleware/authMiddleware';
import { casbinMiddleware } from '../middleware/casbinMiddleware';

const router = Router();

// Public
router.use('/auth', authRoutes);

// Protected — auth + authz on every request
router.use('/racks', authMiddleware, casbinMiddleware, rackRoutes);
router.use('/equipment', authMiddleware, casbinMiddleware, equipmentRoutes);

export default router;