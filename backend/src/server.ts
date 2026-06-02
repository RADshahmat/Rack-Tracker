import dotenv from 'dotenv';
import app from './app';
import { initEnforcer } from './casbin/enforcer';

dotenv.config();

const PORT = process.env.PORT || 3000;

async function bootstrap() {
    await initEnforcer();
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