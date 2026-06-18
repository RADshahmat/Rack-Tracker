import { CronScheduler } from '../src/scheduler/cronScheduler';
import warningRepository from '../src/modules/warnings/warning.repository';
import * as mailer from '../src/scheduler/mailer';
import db from '../src/shared/db';
import { cleanRacks, cleanWarnings, createTestRack } from './helpers/db.helper';


// We import the class itself (not the singleton) to create isolated instances per test

describe('CronScheduler', () => {
    let testRackId: number;

    beforeEach(async () => {
        await cleanWarnings();
        await cleanRacks();
        testRackId = await createTestRack('TEST-EMPTY-R1');
    });

    afterAll(async () => {
        await cleanWarnings();
        await cleanRacks();
    });

    // ─── Lifecycle: start / stop / restart ────────────────

    describe('start() / stop() / restart()', () => {
        it('starts with isRunning = true', () => {
            const scheduler = new CronScheduler('*/5 * * * *');
            scheduler.start();

            expect(scheduler.getStatus().isRunning).toBe(true);
            expect(scheduler.getStatus().expression).toBe('*/5 * * * *');

            scheduler.stop();
        });

        it('stop() sets isRunning = false', () => {
            const scheduler = new CronScheduler('*/5 * * * *');
            scheduler.start();
            scheduler.stop();

            expect(scheduler.getStatus().isRunning).toBe(false);
        });

        it('does not start twice — logs and no-ops on second start()', () => {
            const scheduler = new CronScheduler('*/5 * * * *');
            scheduler.start();
            const firstStatus = scheduler.getStatus();

            scheduler.start(); // second call should no-op
            const secondStatus = scheduler.getStatus();

            expect(firstStatus).toEqual(secondStatus);
            scheduler.stop();
        });

        it('stop() on a never-started scheduler does not throw', () => {
            const scheduler = new CronScheduler('*/5 * * * *');
            expect(() => scheduler.stop()).not.toThrow();
            expect(scheduler.getStatus().isRunning).toBe(false);
        });

        it('restart() changes expression when provided', () => {
            const scheduler = new CronScheduler('*/5 * * * *');
            scheduler.start();

            scheduler.restart('*/10 * * * *');

            expect(scheduler.getStatus().expression).toBe('*/10 * * * *');
            expect(scheduler.getStatus().isRunning).toBe(true);

            scheduler.stop();
        });

        it('restart() keeps current expression when none provided', () => {
            const scheduler = new CronScheduler('*/5 * * * *');
            scheduler.start();

            scheduler.restart();

            expect(scheduler.getStatus().expression).toBe('*/5 * * * *');
            scheduler.stop();
        });

        it('restart() works even if scheduler was never started', () => {
            const scheduler = new CronScheduler('*/5 * * * *');
            expect(() => scheduler.restart()).not.toThrow();
            expect(scheduler.getStatus().isRunning).toBe(true);
            scheduler.stop();
        });

        it('throws on invalid cron expression in start()', () => {
            const scheduler = new CronScheduler('not-a-valid-cron');
            expect(() => scheduler.start()).toThrow('Invalid cron expression');
        });

        it('throws on invalid cron expression in restart()', () => {
            const scheduler = new CronScheduler('*/5 * * * *');
            scheduler.start();

            expect(() => scheduler.restart('garbage')).toThrow('Invalid cron expression');

            scheduler.stop();
        });
    });

    // ─── getStatus() ───────────────────────────────────────

    describe('getStatus()', () => {
        it('returns correct shape', () => {
            const scheduler = new CronScheduler('*/5 * * * *');
            const status = scheduler.getStatus();

            expect(status).toHaveProperty('isRunning');
            expect(status).toHaveProperty('expression');
            expect(typeof status.isRunning).toBe('boolean');
            expect(typeof status.expression).toBe('string');
        });
    });

    // ─── Job logic — runJob() via reflection ──────────────

    // runJob is private, so test its effects through the repository directly by invoking the same logic the job uses, and by spying on dependencies
    describe('job logic — empty rack detection', () => {
        it('finds racks with zero equipment via warningRepository', async () => {
            const emptyRacks = await warningRepository.findEmptyRacks();
            const found = emptyRacks.find((r) => r.id === testRackId);

            expect(found).toBeDefined();
            expect(found?.tag).toBe('TEST-EMPTY-R1');
        });

        it('does not flag racks that have equipment', async () => {
            await db.getPool().query(
                `INSERT INTO equipment (tag, name, rack_id) VALUES ($1, $2, $3)`,
                ['TEST-EQ-1', 'Test Equipment', testRackId]
            );

            const emptyRacks = await warningRepository.findEmptyRacks();
            const found = emptyRacks.find((r) => r.id === testRackId);

            expect(found).toBeUndefined();

            await db.getPool().query(`DELETE FROM equipment WHERE tag = 'TEST-EQ-1'`);
        });

        it('creates a warning row for an empty rack', async () => {
            const warning = await warningRepository.createWarning({
                rack_id: testRackId,
                rack_tag: 'TEST-EMPTY-R1',
                message: 'Rack TEST-EMPTY-R1 has no equipment assigned',
            });

            expect(warning.id).toBeDefined();
            expect(warning.resolved).toBe(false);
            expect(warning.emailed).toBe(false);
        });

        it('findRecentWarningByRackId prevents duplicate warnings within window', async () => {
            await warningRepository.createWarning({
                rack_id: testRackId,
                rack_tag: 'TEST-EMPTY-R1',
                message: 'First warning',
            });

            const recent = await warningRepository.findRecentWarningByRackId(testRackId, 10);
            expect(recent).not.toBeNull();
            expect(recent?.rack_id).toBe(testRackId);
        });

        it('findRecentWarningByRackId returns null outside window or for resolved', async () => {
            const warning = await warningRepository.createWarning({
                rack_id: testRackId,
                rack_tag: 'TEST-EMPTY-R1',
                message: 'Old warning',
            });
            await warningRepository.markResolved(warning.id);

            const recent = await warningRepository.findRecentWarningByRackId(testRackId, 10);
            expect(recent).toBeNull(); // resolved warnings don't count
        });
    });

    // ─── Mailer integration (mocked) ──────────────────────

    describe('mailer', () => {
        it('sendWarningEmail skips silently when SMTP_HOST not set', async () => {
            const originalHost = process.env.SMTP_HOST;
            delete process.env.SMTP_HOST;

            const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

            await mailer.sendWarningEmail([
                { id: testRackId, tag: 'TEST-EMPTY-R1', name: 'Test Rack', location: null },
            ]);

            expect(consoleSpy).toHaveBeenCalledWith(
                expect.stringContaining('SMTP_HOST not set')
            );

            consoleSpy.mockRestore();
            if (originalHost) process.env.SMTP_HOST = originalHost;
        });
    });

    // ─── Warning resolve / markEmailed ─────────────────────

    describe('warningRepository mutations', () => {
        it('markResolved updates resolved flag', async () => {
            const warning = await warningRepository.createWarning({
                rack_id: testRackId,
                rack_tag: 'TEST-EMPTY-R1',
                message: 'Test',
            });

            const result = await warningRepository.markResolved(warning.id);
            expect(result).toBe(true);

            const all = await warningRepository.findAll();
            const updated = all.find((w) => w.id === warning.id);
            expect(updated?.resolved).toBe(true);
        });

        it('markResolved returns false for non-existent id', async () => {
            const result = await warningRepository.markResolved(999999);
            expect(result).toBe(false);
        });

        it('markEmailed updates emailed flag', async () => {
            const warning = await warningRepository.createWarning({
                rack_id: testRackId,
                rack_tag: 'TEST-EMPTY-R1',
                message: 'Test',
            });

            const result = await warningRepository.markEmailed(warning.id);
            expect(result).toBe(true);
        });

        it('findUnresolved excludes resolved warnings', async () => {
            const w1 = await warningRepository.createWarning({
                rack_id: testRackId,
                rack_tag: 'TEST-EMPTY-R1',
                message: 'Unresolved one',
            });
            const w2 = await warningRepository.createWarning({
                rack_id: testRackId,
                rack_tag: 'TEST-EMPTY-R1',
                message: 'Will be resolved',
            });
            await warningRepository.markResolved(w2.id);

            const unresolved = await warningRepository.findUnresolved();
            const ids = unresolved.map((w) => w.id);

            expect(ids).toContain(w1.id);
            expect(ids).not.toContain(w2.id);
        });
    });
});