import supertest from 'supertest';
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import app from '../src/app';
import { authMiddleware } from '../src/middleware/authMiddleware';
import authService from '../src/modules/auth/auth.service';

describe('Auth', () => {
    // ─── HTTP-level tests  ──────────────────────

    describe('POST /api/auth/login', () => {
        it('returns 200 and sets cookie on valid credentials', async () => {
            const res = await supertest(app)
                .post('/api/auth/login')
                .send({ username: 'admin', password: 'password123' });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.username).toBe('admin');
            expect(res.body.data.role).toBe('admin');
            expect(res.body.data.password).toBeUndefined();
            expect(res.headers['set-cookie']).toBeDefined();
        });

        it('returns 401 on wrong password', async () => {
            const res = await supertest(app)
                .post('/api/auth/login')
                .send({ username: 'admin', password: 'wrongpassword' });

            expect(res.status).toBe(401);
            expect(res.body.message).toBe('Invalid username or password');
        });

        it('returns 401 on wrong username', async () => {
            const res = await supertest(app)
                .post('/api/auth/login')
                .send({ username: 'nonexistent', password: 'password123' });

            expect(res.status).toBe(401);
        });

        it('returns same error message for wrong user vs wrong password (no enumeration)', async () => {
            const wrongUser = await supertest(app)
                .post('/api/auth/login')
                .send({ username: 'doesnotexist', password: 'password123' });

            const wrongPass = await supertest(app)
                .post('/api/auth/login')
                .send({ username: 'admin', password: 'wrongpass' });

            expect(wrongUser.body.message).toBe(wrongPass.body.message);
        });

        it('returns 400 on missing username', async () => {
            const res = await supertest(app)
                .post('/api/auth/login')
                .send({ password: 'password123' });

            expect(res.status).toBe(400);
        });

        it('returns 400 on missing password', async () => {
            const res = await supertest(app)
                .post('/api/auth/login')
                .send({ username: 'admin' });

            expect(res.status).toBe(400);
        });

        it('returns 400 on empty body', async () => {
            const res = await supertest(app)
                .post('/api/auth/login')
                .send({});

            expect(res.status).toBe(400);
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
        });

        it('returns 401 with malformed cookie', async () => {
            const res = await supertest(app)
                .get('/api/auth/me')
                .set('Cookie', 'token=garbage-not-a-jwt');

            expect(res.status).toBe(401);
        });

        it('returns 401 with expired token', async () => {
            const expiredToken = jwt.sign(
                { userId: 1, username: 'admin', role: 'admin' },
                process.env.JWT_SECRET as string,
                { expiresIn: '-1s' } // already expired
            );

            const res = await supertest(app)
                .get('/api/auth/me')
                .set('Cookie', `token=${expiredToken}`);

            expect(res.status).toBe(401);
        });

        it('returns 401 with token signed by wrong secret', async () => {
            const forgedToken = jwt.sign(
                { userId: 1, username: 'admin', role: 'admin' },
                'wrong-secret-key',
                { expiresIn: '7d' }
            );

            const res = await supertest(app)
                .get('/api/auth/me')
                .set('Cookie', `token=${forgedToken}`);

            expect(res.status).toBe(401);
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

            const clearedCookie = res.headers['set-cookie']?.[0] || '';
            expect(clearedCookie).toContain('token=;');
        });

        it('returns 200 even without a cookie (idempotent)', async () => {
            const res = await supertest(app).post('/api/auth/logout');
            expect(res.status).toBe(200);
        });
    });

    describe('Rate limiting', () => {
        it('returns 429 after exceeding login attempts', async () => {
            const attempts = Array.from({ length: 11 }, () =>
                supertest(app)
                    .post('/api/auth/login')
                    .send({ username: 'admin', password: 'wrongpassword' })
            );

            const results = await Promise.all(attempts);
            const lastResult = results[results.length - 1];

            expect(lastResult.status).toBe(429);
        });
    });

    // ─── Unit tests — authMiddleware directly ─────────────

    describe('authMiddleware (unit)', () => {
        const mockNext = jest.fn() as NextFunction;
        const mockRes = () => {
            const res: Partial<Response> = {};
            res.status = jest.fn().mockReturnValue(res);
            res.json = jest.fn().mockReturnValue(res);
            res.clearCookie = jest.fn().mockReturnValue(res);
            return res as Response;
        };

        afterEach(() => {
            jest.clearAllMocks();
        });

        it('calls next() and attaches user when token is valid', () => {
            const token = jwt.sign(
                { userId: 1, username: 'admin', role: 'admin' },
                process.env.JWT_SECRET as string,
                { expiresIn: '7d' }
            );

            const req = { cookies: { token } } as unknown as Request;
            const res = mockRes();

            authMiddleware(req, res, mockNext);

            expect(mockNext).toHaveBeenCalled();
            expect(req.user).toBeDefined();
            expect(req.user?.username).toBe('admin');
        });

        it('returns 401 when no cookies object exists', () => {
            const req = {} as Request;
            const res = mockRes();

            authMiddleware(req, res, mockNext);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(mockNext).not.toHaveBeenCalled();
        });

        it('returns 401 when token cookie is missing', () => {
            const req = { cookies: {} } as Request;
            const res = mockRes();

            authMiddleware(req, res, mockNext);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(mockNext).not.toHaveBeenCalled();
        });

        it('returns 401 and clears cookie when token is invalid', () => {
            const req = { cookies: { token: 'invalid.token.here' } } as unknown as Request;
            const res = mockRes();

            authMiddleware(req, res, mockNext);

            expect(res.clearCookie).toHaveBeenCalledWith('token');
            expect(res.status).toHaveBeenCalledWith(401);
            expect(mockNext).not.toHaveBeenCalled();
        });
    });

    // ─── Unit tests — auth.service directly ───────────────

    describe('auth.service (unit)', () => {
        it('login() throws AppError on non-existent user', async () => {
            await expect(
                authService.login({ username: 'ghost-user', password: 'anything' })
            ).rejects.toThrow('Invalid username or password');
        });

        it('login() throws AppError on wrong password', async () => {
            await expect(
                authService.login({ username: 'admin', password: 'wrongpassword' })
            ).rejects.toThrow('Invalid username or password');
        });

        it('login() returns user + token on valid credentials', async () => {
            const result = await authService.login({
                username: 'viewer',
                password: 'password123',
            });

            expect(result.user.username).toBe('viewer');
            expect(result.user.role).toBe('viewer');
            expect(typeof result.token).toBe('string');
        });

        it('login() never returns password field', async () => {
            const result = await authService.login({
                username: 'admin',
                password: 'password123',
            });

            expect(result.user).not.toHaveProperty('password');
        });

        it('getMe() returns public user for valid id', async () => {
            const { user } = await authService.login({
                username: 'admin',
                password: 'password123',
            });

            const me = await authService.getMe(user.id);
            expect(me.username).toBe('admin');
        });

        it('getMe() throws AppError for non-existent id', async () => {
            await expect(authService.getMe(999999)).rejects.toThrow('User not found');
        });
    });
});