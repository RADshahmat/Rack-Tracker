// tests/setup.ts — top of file
process.env.DATABASE_URL = "postgresql://rackuser:rackpass@localhost:5433/racktracker";
import db from '../src/shared/db';
import { initEnforcer } from '../src/casbin/enforcer';
import { scheduler } from '../src/scheduler/cronScheduler';


// Run once before all test suites
beforeAll(async () => {
    await initEnforcer();
});

// Stop scheduler and close DB pool after all tests
afterAll(async () => {
    scheduler.stop();
    await db.getPool().end();
});

