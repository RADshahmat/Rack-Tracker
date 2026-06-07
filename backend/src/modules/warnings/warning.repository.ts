import { Pool } from 'pg';
import db from '../../shared/db';
import { Warning, CreateWarningInput, EmptyRack } from './warning.types';

export interface IWarningRepository {
    findEmptyRacks(): Promise<EmptyRack[]>;
    createWarning(data: CreateWarningInput): Promise<Warning>;
    findUnresolved(): Promise<Warning[]>;
    findAll(): Promise<Warning[]>;
    markResolved(id: number): Promise<boolean>;
    markEmailed(id: number): Promise<boolean>;
    findRecentWarningByRackId(rackId: number, withinMinutes: number): Promise<Warning | null>;
}

class WarningRepository implements IWarningRepository {
    private pool: Pool;

    constructor() {
        this.pool = db.getPool();
    }

    // Find racks with zero equipment assigned
    async findEmptyRacks(): Promise<EmptyRack[]> {
        const query = `
            SELECT r.id, r.tag, r.name, r.location
            FROM racks r
            LEFT JOIN equipment e ON e.rack_id = r.id
            GROUP BY r.id, r.tag, r.name, r.location
            HAVING COUNT(e.id) = 0
            ORDER BY r.tag ASC
        `;
        const result = await this.pool.query(query);
        return result.rows;
    }

    async createWarning(data: CreateWarningInput): Promise<Warning> {
        const query = `
            INSERT INTO warnings (rack_id, rack_tag, message)
            VALUES ($1, $2, $3)
            RETURNING *
        `;
        const result = await this.pool.query(query, [
            data.rack_id,
            data.rack_tag,
            data.message,
        ]);
        return result.rows[0];
    }

    async findAll(): Promise<Warning[]> {
        const query = `
            SELECT * FROM warnings
            ORDER BY created_at DESC
        `;
        const result = await this.pool.query(query);
        return result.rows;
    }

    async findUnresolved(): Promise<Warning[]> {
        const query = `
            SELECT * FROM warnings
            WHERE resolved = FALSE
            ORDER BY created_at DESC
        `;
        const result = await this.pool.query(query);
        return result.rows;
    }

    async markResolved(id: number): Promise<boolean> {
        const query = `
            UPDATE warnings SET resolved = TRUE WHERE id = $1
        `;
        const result = await this.pool.query(query, [id]);
        return (result.rowCount ?? 0) > 0;
    }

    async markEmailed(id: number): Promise<boolean> {
        const query = `
            UPDATE warnings SET emailed = TRUE WHERE id = $1
        `;
        const result = await this.pool.query(query, [id]);
        return (result.rowCount ?? 0) > 0;
    }

    // Prevent duplicate warnings — check if a warning exists for
    // this rack in the last N minutes
    async findRecentWarningByRackId(
        rackId: number,
        withinMinutes: number
    ): Promise<Warning | null> {
        const query = `
            SELECT * FROM warnings
            WHERE rack_id = $1
              AND resolved = FALSE
              AND created_at > NOW() - INTERVAL '${withinMinutes} minutes'
            ORDER BY created_at DESC
            LIMIT 1
        `;
        const result = await this.pool.query(query, [rackId]);
        return result.rows[0] || null;
    }
}

export default new WarningRepository();