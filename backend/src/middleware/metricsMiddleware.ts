import { Request, Response, NextFunction } from 'express';
import { httpRequestsTotal, httpRequestDurationSeconds } from '../metrics/registry';

// Normalize path to avoid unbounded cardinality
// /api/racks/42 → /api/racks/:id
// /api/equipment/rack/5 → /api/equipment/rack/:rackId
function normalizePath(path: string): string {
    return path
        .replace(/\/rack\/\d+/g, '/rack/:rackId')
        .replace(/\/\d+/g, '/:id')
        .replace(/\/$/, '')
        || '/';
}

export const metricsMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    const start = Date.now();
    const route = normalizePath(req.path);
    const method = req.method;

    res.on('finish', () => {
        const duration = (Date.now() - start) / 1000;
        const statusCode = res.statusCode.toString();

        httpRequestsTotal.inc({ method, route, status_code: statusCode });
        httpRequestDurationSeconds.observe({ method, route }, duration);
        console.log(`[Metrics] ${method} ${route} - ${statusCode} (${duration.toFixed(3)}s)`);
    });

    next();
};