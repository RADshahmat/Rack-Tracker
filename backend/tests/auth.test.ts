import supertest from 'supertest';
import app from '../src/app';


describe('Auth', () => {
    describe('POST /api/auth/login', () => {
        it('returns 200 and sets cookie on valid credentials', async () => {
            const res = await supertest(app)
                .post('/api/auth/login')
                .send({ username: 'admin', password: 'password123' });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.username).toBe('admin');
            expect(res.body.data.role).toBe('admin');
            expect(res.body.data.password).toBeUndefined(); // never expose password
            expect(res.headers['set-cookie']).toBeDefined();
        });

        it('returns 401 on wrong password', async () => {
            const res = await supertest(app)
                .post('/api/auth/login')
                .send({ username: 'admin', password: 'wrongpassword' });

            expect(res.status).toBe(401);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toBe('Invalid username or password');
        });

        it('returns 401 on wrong username', async () => {
            const res = await supertest(app)
                .post('/api/auth/login')
                .send({ username: 'nonexistent', password: 'password123' });

            expect(res.status).toBe(401);
            expect(res.body.success).toBe(false);
        });

        it('returns 400 on missing fields', async () => {
            const res = await supertest(app)
                .post('/api/auth/login')
                .send({ username: 'admin' });

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
        });
    });

    describe('GET /api/auth/me', () => {
        it('returns 200 with user data when authenticated', async () => {
            const loginRes = await supertest(app)
                .post('/api/auth/login')
                .send({ username: 'operator', password: 'password123' });

            const cookie = loginRes.headers['set-cookie'];

            const res = await supertest(app)
                .get('/api/auth/me')
                .set('Cookie', cookie);

            expect(res.status).toBe(200);
            expect(res.body.data.username).toBe('operator');
            expect(res.body.data.role).toBe('operator');
        });

        it('returns 401 when no cookie', async () => {
            const res = await supertest(app).get('/api/auth/me');
            expect(res.status).toBe(401);
            expect(res.body.success).toBe(false);
        });
    });

    describe('POST /api/auth/logout', () => {
        it('returns 200 and clears cookie', async () => {
            const loginRes = await supertest(app)
                .post('/api/auth/login')
                .send({ username: 'admin', password: 'password123' });

            const cookie = loginRes.headers['set-cookie'];

            const res = await supertest(app)
                .post('/api/auth/logout')
                .set('Cookie', cookie);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);

            // Cookie should be cleared
            const clearedCookie = res.headers['set-cookie']?.[0] || '';
            expect(clearedCookie).toContain('token=;');
        });
    });
});