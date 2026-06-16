import { Router } from 'express';
import rackRoutes from './rack.routes';
import equipmentRoutes from './equipment.routes';
import authRoutes from './auth.routes';
import adminRoutes from './admin.routes';
import warningRoutes from './warning.route';
import { authMiddleware } from '../middleware/authMiddleware';
import { casbinMiddleware } from '../middleware/casbinMiddleware';
import alertRoutes from './alert.routes';

const router = Router();

// Public
router.use('/auth', authRoutes);
router.use('/alerts', alertRoutes);

// Protected — auth + authz on every request
router.use('/racks', authMiddleware, casbinMiddleware, rackRoutes);
router.use('/equipment', authMiddleware, casbinMiddleware, equipmentRoutes);
router.use('/warnings', authMiddleware, casbinMiddleware, warningRoutes);
router.use('/admin', authMiddleware, casbinMiddleware, adminRoutes);

export default router;