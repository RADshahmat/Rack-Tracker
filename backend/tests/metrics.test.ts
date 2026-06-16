import supertest from 'supertest';
import app from '../src/app';
import { loginAs } from './helpers/auth.helper';
import { racksCreatedTotal } from '../src/metrics/registry';

describe('Metrics', () => {
    describe('GET /metrics', () => {
        it('returns 200 with prometheus text format', async () => {
            const res = await supertest(app).get('/metrics');

            expect(res.status).toBe(200);
            expect(res.headers['content-type']).toContain('text/plain');
            expect(res.text).toContain('racks_created_total');
            expect(res.text).toContain('http_requests_total');
            expect(res.text).toContain('auth_login_total');
        });

        it('is publicly accessible — no auth required', async () => {
            const res = await supertest(app).get('/metrics');
            expect(res.status).toBe(200);
        });

        it('increments racks_created_total on rack creation', async () => {
            const cookie = await loginAs('admin');

            // Get initial value
            const before = await supertest(app).get('/metrics');
            const beforeMatch = before.text.match(/racks_created_total (\d+)/);
            const beforeCount = beforeMatch ? parseInt(beforeMatch[1]) : 0;

            // Create a rack
            await supertest(app)
                .post('/api/racks')
                .set('Cookie', cookie)
                .send({ tag: 'TEST-METRIC-R1', name: 'Metric Test Rack' });

            // Check counter incremented
            const after = await supertest(app).get('/metrics');
            const afterMatch = after.text.match(/racks_created_total (\d+)/);
            const afterCount = afterMatch ? parseInt(afterMatch[1]) : 0;

            expect(afterCount).toBe(beforeCount + 1);

            // Cleanup
            const racksRes = await supertest(app)
                .get('/api/racks')
                .set('Cookie', cookie);
            const rack = racksRes.body.data.find((r: any) => r.tag === 'TEST-METRIC-R1');
            if (rack) {
                await supertest(app)
                    .delete(`/api/racks/${rack.id}`)
                    .set('Cookie', cookie);
            }
        });

        it('tracks auth login attempts', async () => {
            // Failed login
            await supertest(app)
                .post('/api/auth/login')
                .send({ username: 'admin', password: 'wrongpassword' });

            const res = await supertest(app).get('/metrics');
            expect(res.text).toContain('auth_login_total{status="failure"}');
        });
    });
});