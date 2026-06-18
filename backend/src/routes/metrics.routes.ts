import { Router, Request, Response } from 'express';
import registry from '../metrics/registry';

const router = Router();


router.get('/', async (_req: Request, res: Response) => {
    try {
        const metrics = await registry.metrics();
        res.set('Content-Type', registry.contentType);
        res.status(200).send(metrics);
    } catch (error) {
        res.status(500).send('Error collecting metrics');
    }
});

export default router;