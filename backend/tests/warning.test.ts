import supertest from 'supertest';
import app from '../src/app';
import { loginAs } from './helpers/auth.helper';
import {
    cleanRacks,
    cleanWarnings,
    createTestRack,
} from './helpers/db.helper';
import db from '../src/shared/db';



describe('Warnings', () => {
    let adminCookie: string;
    let operatorCookie: string;
    let viewerCookie: string;
    let testRackId: number;
    let testWarningId: number;

    beforeAll(async () => {
        adminCookie = await loginAs('admin');
        operatorCookie = await loginAs('operator');
        viewerCookie = await loginAs('viewer');

        // Create a test rack and a warning for it
        testRackId = await createTestRack('TEST-R1');

        const result = await db.getPool().query(
            `INSERT INTO warnings (rack_id, rack_tag, message)
             VALUES ($1, $2, $3) RETURNING id`,
            [testRackId, 'TEST-R1', 'Test rack has no equipment assigned']
        );
        testWarningId = result.rows[0].id;
    });

    afterAll(async () => {
        await cleanWarnings();
        await cleanRacks();
    });

    // ── GET /api/warnings ─────────────────────────────────

    describe('GET /api/warnings', () => {
        it('returns 200 for admin', async () => {
            const res = await supertest(app)
                .get('/api/warnings')
                .set('Cookie', adminCookie);

            expect(res.status).toBe(200);
            expect(Array.isArray(res.body.data)).toBe(true);
        });

        it('returns 403 for operator', async () => {
            const res = await supertest(app)
                .get('/api/warnings')
                .set('Cookie', operatorCookie);

            expect(res.status).toBe(403);
        });

        it('returns 403 for viewer', async () => {
            const res = await supertest(app)
                .get('/api/warnings')
                .set('Cookie', viewerCookie);

            expect(res.status).toBe(403);
        });

        it('returns 401 with no cookie', async () => {
            const res = await supertest(app).get('/api/warnings');
            expect(res.status).toBe(401);
        });
    });

    // ── GET /api/warnings/unresolved ──────────────────────

    describe('GET /api/warnings/unresolved', () => {
        it('returns only unresolved warnings', async () => {
            const res = await supertest(app)
                .get('/api/warnings/unresolved')
                .set('Cookie', adminCookie);

            expect(res.status).toBe(200);
            expect(res.body.data.every((w: any) => w.resolved === false)).toBe(true);
        });
    });

    // ── PATCH /api/warnings/:id/resolve ───────────────────

    describe('PATCH /api/warnings/:id/resolve', () => {
        it('returns 200 and resolves warning for admin', async () => {
            const res = await supertest(app)
                .patch(`/api/warnings/${testWarningId}/resolve`)
                .set('Cookie', adminCookie);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);

            // Verify it's actually resolved in DB
            const result = await db.getPool().query(
                'SELECT resolved FROM warnings WHERE id = $1',
                [testWarningId]
            );
            expect(result.rows[0].resolved).toBe(true);
        });

        it('returns 403 for operator', async () => {
            const res = await supertest(app)
                .patch(`/api/warnings/${testWarningId}/resolve`)
                .set('Cookie', operatorCookie);

            expect(res.status).toBe(403);
        });

        it('returns 404 for non-existent warning', async () => {
            const res = await supertest(app)
                .patch('/api/warnings/999999/resolve')
                .set('Cookie', adminCookie);

            expect(res.status).toBe(404);
        });
    });
});