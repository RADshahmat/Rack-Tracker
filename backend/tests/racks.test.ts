import { describe, it, expect, beforeAll, afterEach } from '@jest/globals';
import supertest from 'supertest';
import app from '../src/app';
import { loginAs } from './helpers/auth.helper';
import { cleanRacks, createTestRack } from './helpers/db.helper';

describe('Racks', () => {
    let adminCookie: string;
    let operatorCookie: string;
    let viewerCookie: string;

    beforeAll(async () => {
        adminCookie = await loginAs('admin');
        operatorCookie = await loginAs('operator');
        viewerCookie = await loginAs('viewer');
    });

    afterEach(async () => {
        await cleanRacks();
    });

    // ── GET /api/racks ────────────────────────────────────

    describe('GET /api/racks', () => {
        it('returns 200 for admin', async () => {
            const res = await supertest(app)
                .get('/api/racks')
                .set('Cookie', adminCookie);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data)).toBe(true);
        });

        it('returns 200 for viewer', async () => {
            const res = await supertest(app)
                .get('/api/racks')
                .set('Cookie', viewerCookie);

            expect(res.status).toBe(200);
        });

        it('returns 401 with no cookie', async () => {
            const res = await supertest(app).get('/api/racks');
            expect(res.status).toBe(401);
        });
    });

    // ── POST /api/racks ───────────────────────────────────

    describe('POST /api/racks', () => {
        it('returns 201 for admin', async () => {
            const res = await supertest(app)
                .post('/api/racks')
                .set('Cookie', adminCookie)
                .send({ tag: 'TEST-R1', name: 'Test Rack', capacity: 42 });

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data.tag).toBe('TEST-R1');
        });

        it('returns 201 for operator', async () => {
            const res = await supertest(app)
                .post('/api/racks')
                .set('Cookie', operatorCookie)
                .send({ tag: 'TEST-R2', name: 'Test Rack 2', capacity: 24 });

            expect(res.status).toBe(201);
        });

        it('returns 403 for viewer', async () => {
            const res = await supertest(app)
                .post('/api/racks')
                .set('Cookie', viewerCookie)
                .send({ tag: 'TEST-R3', name: 'Test Rack 3' });

            expect(res.status).toBe(403);
            expect(res.body.success).toBe(false);
        });

        it('returns 400 on duplicate tag', async () => {
            await supertest(app)
                .post('/api/racks')
                .set('Cookie', adminCookie)
                .send({ tag: 'TEST-R1', name: 'First Rack' });

            const res = await supertest(app)
                .post('/api/racks')
                .set('Cookie', adminCookie)
                .send({ tag: 'TEST-R1', name: 'Duplicate Rack' });

            expect(res.status).toBe(400);
            expect(res.body.errors[0].field).toBe('tag');
        });

        it('returns 400 on missing required fields', async () => {
            const res = await supertest(app)
                .post('/api/racks')
                .set('Cookie', adminCookie)
                .send({ tag: 'TEST-R1' }); // missing name

            expect(res.status).toBe(400);
        });

        it('returns 400 on invalid tag format', async () => {
            const res = await supertest(app)
                .post('/api/racks')
                .set('Cookie', adminCookie)
                .send({ tag: 'invalid_tag', name: 'Test Rack' });

            expect(res.status).toBe(400);
        });
    });

    // ── PUT /api/racks/:id ────────────────────────────────

    describe('PUT /api/racks/:id', () => {
        it('returns 200 for admin', async () => {
            const id = await createTestRack('TEST-R1');

            const res = await supertest(app)
                .put(`/api/racks/${id}`)
                .set('Cookie', adminCookie)
                .send({ name: 'Updated Name' });

            expect(res.status).toBe(200);
            expect(res.body.data.name).toBe('Updated Name');
        });

        it('returns 403 for viewer', async () => {
            const id = await createTestRack('TEST-R1');

            const res = await supertest(app)
                .put(`/api/racks/${id}`)
                .set('Cookie', viewerCookie)
                .send({ name: 'Updated Name' });

            expect(res.status).toBe(403);
        });

        it('returns 404 for non-existent rack', async () => {
            const res = await supertest(app)
                .put('/api/racks/999999')
                .set('Cookie', adminCookie)
                .send({ name: 'Updated Name' });

            expect(res.status).toBe(404);
        });
    });

    // ── DELETE /api/racks/:id ─────────────────────────────

    describe('DELETE /api/racks/:id', () => {
        it('returns 200 for admin', async () => {
            const id = await createTestRack('TEST-R1');

            const res = await supertest(app)
                .delete(`/api/racks/${id}`)
                .set('Cookie', adminCookie);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
        });

        it('returns 403 for operator', async () => {
            const id = await createTestRack('TEST-R1');

            const res = await supertest(app)
                .delete(`/api/racks/${id}`)
                .set('Cookie', operatorCookie);

            expect(res.status).toBe(403);
        });

        it('returns 403 for viewer', async () => {
            const id = await createTestRack('TEST-R1');

            const res = await supertest(app)
                .delete(`/api/racks/${id}`)
                .set('Cookie', viewerCookie);

            expect(res.status).toBe(403);
        });

        it('returns 404 for non-existent rack', async () => {
            const res = await supertest(app)
                .delete('/api/racks/999999')
                .set('Cookie', adminCookie);

            expect(res.status).toBe(404);
        });
    });

    // ── GET /api/racks/:id/slots ──────────────────────────

    describe('GET /api/racks/:id/slots', () => {
        it('returns slot availability', async () => {
            const id = await createTestRack('TEST-R1');

            const res = await supertest(app)
                .get(`/api/racks/${id}/slots`)
                .set('Cookie', viewerCookie);

            expect(res.status).toBe(200);
            expect(res.body.data).toHaveProperty('total');
            expect(res.body.data).toHaveProperty('available');
            expect(res.body.data).toHaveProperty('occupied');
            expect(res.body.data.total).toBe(42);
            expect(res.body.data.availableCount).toBe(42); // no equipment yet
        });

        it('returns 404 for non-existent rack', async () => {
            const res = await supertest(app)
                .get('/api/racks/999999/slots')
                .set('Cookie', adminCookie);

            expect(res.status).toBe(404);
        });
    });
});