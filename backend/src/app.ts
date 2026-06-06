import express, { Application, NextFunction, Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { requestLogger } from './shared/logger';
import { errorHandler } from './shared/errorHandler';
import { bodySanitizer } from './shared/sanitizer';
import router from './routes';
import db from './shared/db';
import helmet from 'helmet';


const app: Application = express();

// Middleware
app.use(
    helmet({
        contentSecurityPolicy: false,
    })
);

app.use(
    helmet.frameguard({
        action: "deny",
    })
);

app.use(
    helmet.hsts({
        maxAge: 63072000,
        includeSubDomains: true,
    })
);

app.use((_req, res, next) => {
    res.setHeader("X-XSS-Protection", "1; mode=block");
    next();
});

app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,                               
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(requestLogger);
app.use(bodySanitizer);

app.use('/api', router);

// Health check endpoint
app.get('/healthz', async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const dbHealthy = await db.healthCheck();

        const status = dbHealthy ? 200 : 503;

        res.status(status).json({
            status: dbHealthy ? 'healthy' : 'unhealthy',
            timestamp: new Date().toISOString(),
            database: dbHealthy ? 'connected' : 'disconnected',
        });
    } catch (error) {
        next(error);
    }
});


// 404 handler
app.use((_req: Request, res: Response) => {
    res.status(404).json({
        success: false,
        message: 'Route not found',
    });
});

// Error handler 
app.use(errorHandler);

export default app;