import supertest from 'supertest';
import app from '../../src/app';

export type Role = 'admin' | 'operator' | 'viewer';

export const loginAs = async (role: Role): Promise<string> => {
    const res = await supertest(app)
        .post('/api/auth/login')
        .send({ username: role, password: 'password123' });

    // Extract cookie from response header
    const cookie = res.headers['set-cookie'];
    if (!cookie) throw new Error(`Login failed for role: ${role}`);

    return Array.isArray(cookie) ? cookie[0] : cookie;
};