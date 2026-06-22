
import supertest from 'supertest';
import app from '../src/app';
import { loginAs } from './helpers/auth.helper';
import {
    cleanRacks,
    cleanEquipment,
    createTestRack,
    createTestEquipment,
} from './helpers/db.helper';

describe('Equipment', () => {
    let adminCookie: string;
    let operatorCookie: string;
    let viewerCookie: string;
    let testRackId: number;

    beforeAll(async () => {
        adminCookie = await loginAs('admin');
        operatorCookie = await loginAs('operator');
        viewerCookie = await loginAs('viewer');
        testRackId = await createTestRack('TEST-R1');
    });

    afterAll(async () => {
        await cleanEquipment();
        await cleanRacks();
    });

    afterEach(async () => {
        await cleanEquipment();
    });

    // ── GET /api/equipment ────────────────────────────────

    describe('GET /api/equipment', () => {
        it('returns 200 with pagination for all roles', async () => {
            const res = await supertest(app)
                .get('/api/equipment?page=1&limit=5')
                .set('Cookie', viewerCookie);

            expect(res.status).toBe(200);

            // ✨ FIX: Target res.body directly since it contains both root fields
            expect(res.body).toHaveProperty('data');
            expect(res.body).toHaveProperty('pagination');

            // Safely verify the pagination limit value works
            expect(res.body.pagination.limit).toBe(5);
            expect(Array.isArray(res.body.data)).toBe(true);
        });

        it('returns 401 with no cookie', async () => {
            const res = await supertest(app).get('/api/equipment');
            expect(res.status).toBe(401);
        });
    });
    
    // ── POST /api/equipment ───────────────────────────────

    describe('POST /api/equipment', () => {
        it('returns 201 for admin with rack assignment', async () => {
            const res = await supertest(app)
                .post('/api/equipment')
                .set('Cookie', adminCookie)
                .send({
                    tag: 'TEST-E1',
                    name: 'Test Server',
                    type: 'server',
                    rack_id: testRackId,
                    slot_position: 1,
                });

            expect(res.status).toBe(201);
            expect(res.body.data.tag).toBe('TEST-E1');
            expect(res.body.data.rack_id).toBe(testRackId);
        });

        it('returns 201 for operator', async () => {
            const res = await supertest(app)
                .post('/api/equipment')
                .set('Cookie', operatorCookie)
                .send({ tag: 'TEST-E2', name: 'Test Switch', type: 'switch' });

            expect(res.status).toBe(201);
        });

        it('returns 403 for viewer', async () => {
            const res = await supertest(app)
                .post('/api/equipment')
                .set('Cookie', viewerCookie)
                .send({ tag: 'TEST-E3', name: 'Test Storage' });

            expect(res.status).toBe(403);
        });

        it('returns 400 on invalid rack_id', async () => {
            const res = await supertest(app)
                .post('/api/equipment')
                .set('Cookie', adminCookie)
                .send({ tag: 'TEST-E1', name: 'Test', rack_id: 999999 });

            expect(res.status).toBe(400);
            expect(res.body.errors[0].field).toBe('rack_id');
        });

        it('returns 400 on duplicate tag', async () => {
            await createTestEquipment('TEST-E1');

            const res = await supertest(app)
                .post('/api/equipment')
                .set('Cookie', adminCookie)
                .send({ tag: 'TEST-E1', name: 'Duplicate' });

            expect(res.status).toBe(400);
        });
    });

    // ── DELETE /api/equipment/:id ─────────────────────────

    describe('DELETE /api/equipment/:id', () => {
        it('returns 200 for admin', async () => {
            const id = await createTestEquipment('TEST-E1');

            const res = await supertest(app)
                .delete(`/api/equipment/${id}`)
                .set('Cookie', adminCookie);

            expect(res.status).toBe(200);
        });

        it('returns 403 for operator', async () => {
            const id = await createTestEquipment('TEST-E1');

            const res = await supertest(app)
                .delete(`/api/equipment/${id}`)
                .set('Cookie', operatorCookie);

            expect(res.status).toBe(403);
        });

        it('returns 403 for viewer', async () => {
            const id = await createTestEquipment('TEST-E1');

            const res = await supertest(app)
                .delete(`/api/equipment/${id}`)
                .set('Cookie', viewerCookie);

            expect(res.status).toBe(403);
        });
    });

    // ── GET /api/equipment/rack/:rackId ───────────────────

    describe('GET /api/equipment/rack/:rackId', () => {
        it('returns equipment for a rack', async () => {
            await createTestEquipment('TEST-E1', testRackId);
            await createTestEquipment('TEST-E2', testRackId);

            const res = await supertest(app)
                .get(`/api/equipment/rack/${testRackId}`)
                .set('Cookie', viewerCookie);

            expect(res.status).toBe(200);
            expect(res.body.data.length).toBe(2);
        });

        it('returns 404 for non-existent rack', async () => {
            const res = await supertest(app)
                .get('/api/equipment/rack/999999')
                .set('Cookie', adminCookie);

            expect(res.status).toBe(404);
        });
    });
});