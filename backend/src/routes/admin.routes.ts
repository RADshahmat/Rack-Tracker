import { Router, Request, Response, NextFunction } from 'express';
import { scheduler } from '../scheduler/cronScheduler';
import { authMiddleware } from '../middleware/authMiddleware';
import { casbinMiddleware } from '../middleware/casbinMiddleware';

const router = Router();

router.get(
    '/restart-cron',
    authMiddleware,
    casbinMiddleware,
    (req: Request, res: Response, next: NextFunction) => {
        try {
            // Optionally accept a new cron expression via query param
            // GET /admin/restart-cron?expression=*/10 * * * *
            const expression = req.query.expression as string | undefined;

            scheduler.restart(expression);
            const status = scheduler.getStatus();

            res.status(200).json({
                success: true,
                message: 'Cron scheduler restarted successfully',
                data: status,
            });
        } catch (error) {
            next(error);
        }
    }
);

router.get(
    '/cron-status',
    authMiddleware,
    casbinMiddleware,
    (_req: Request, res: Response) => {
        const status = scheduler.getStatus();
        res.status(200).json({
            success: true,
            message: 'Cron status retrieved',
            data: status,
        });
    }
);

export default router;