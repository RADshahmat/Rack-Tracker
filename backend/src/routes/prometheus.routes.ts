import { Router, Request, Response, NextFunction } from 'express';
import { generatePrometheusConfig } from '../prometheus/configGenerator';
import { reloadPrometheus, checkPrometheusHealth } from '../prometheus/reloader';
import { ApiResponse } from '../shared/types';

const router = Router();

// POST /api/prometheus/reload
// Admin only — protected by authMiddleware + casbinMiddleware in index.ts
// 1. Generates prometheus.yml from DB
// 2. Validates YAML
// 3. Writes to disk
// 4. POSTs /-/reload to Prometheus
router.post('/reload', async (_req: Request, res: Response, next: NextFunction) => {
    try {
        // Check Prometheus is reachable first
        const healthy = await checkPrometheusHealth();
        if (!healthy) {
            res.status(503).json({
                success: false,
                message: 'Prometheus is not reachable. Config was not reloaded.',
            });
            return;
        }

        // Generate + write config
        const result = await generatePrometheusConfig();

        // Hot-reload Prometheus
        await reloadPrometheus();

        const response: ApiResponse = {
            success: true,
            message: 'Prometheus config regenerated and reloaded',
            data: {
                jobCount: result.jobCount,
                dynamicJobCount: result.dynamicJobCount,
                configPath: process.env.PROMETHEUS_CONFIG_PATH || 'prometheus/prometheus.yml',
            },
        };
        res.status(200).json(response);
    } catch (error) {
        next(error);
    }
});

// GET /api/prometheus/config
// Admin only — returns current generated YAML for inspection
router.get('/config', async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await generatePrometheusConfig();

        res.status(200).json({
            success: true,
            message: 'Current Prometheus config (dry run — not written)',
            data: {
                jobCount: result.jobCount,
                dynamicJobCount: result.dynamicJobCount,
                yaml: result.yaml,
            },
        });
    } catch (error) {
        next(error);
    }
});

// GET /api/prometheus/status
// Admin only — check if Prometheus is reachable
router.get('/status', async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const healthy = await checkPrometheusHealth();
        res.status(healthy ? 200 : 503).json({
            success: healthy,
            message: healthy ? 'Prometheus is healthy' : 'Prometheus is unreachable',
            data: {
                url: process.env.PROMETHEUS_URL || 'http://prometheus:9090',
                healthy,
            },
        });
    } catch (error) {
        next(error);
    }
});

export default router;