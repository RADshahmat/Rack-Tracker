import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import { initEnforcer } from './casbin/enforcer';
import { scheduler } from './scheduler/cronScheduler';

const PORT = process.env.PORT || 3000;

async function bootstrap() {
    // 1. Init Casbin
    await initEnforcer();

    // 2. Start cron scheduler
    scheduler.start();

    // 3. Start server
    app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
        console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log(`🔗 Health check: http://localhost:${PORT}/healthz`);
    });
}

bootstrap().catch((err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
});