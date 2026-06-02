import { Router, Request, Response, NextFunction } from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import { casbinMiddleware } from '../middleware/casbinMiddleware';

const router = Router();

// Placeholder — wired up properly when scheduler is built
router.get(
    '/restart-cron',
    authMiddleware,
    casbinMiddleware,
    (_req: Request, res: Response, _next: NextFunction) => {
        res.status(200).json({
            success: true,
            message: 'Cron restart endpoint ready — scheduler not yet initialized',
        });
    }
);

export default router;