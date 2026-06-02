import { Pool } from 'pg';
import db from '../../shared/db';
import { User } from './auth.types';

export interface IAuthRepository {
    findByUsername(username: string): Promise<User | null>;
    findById(id: number): Promise<User | null>;
}

class AuthRepository implements IAuthRepository {
    private pool: Pool;

    constructor() {
        this.pool = db.getPool();
    }

    async findByUsername(username: string): Promise<User | null> {
        const query = `
            SELECT id, username, email, password, role, created_at, updated_at
            FROM users
            WHERE username = $1
        `;
        const result = await this.pool.query(query, [username]);
        return result.rows[0] || null;
    }

    async findById(id: number): Promise<User | null> {
        const query = `
            SELECT id, username, email, password, role, created_at, updated_at
            FROM users
            WHERE id = $1
        `;
        const result = await this.pool.query(query, [id]);
        return result.rows[0] || null;
    }
}

export default new AuthRepository();