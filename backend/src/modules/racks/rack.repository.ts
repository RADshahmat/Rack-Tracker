import { Pool } from 'pg';
import db from '../../shared/db';
import { Rack, CreateRackInput, UpdateRackInput, RackAttachment, CreateAttachmentInput } from './rack.types';

export interface IRackRepository {
    findAll(): Promise<Rack[]>;
    findById(id: number): Promise<Rack | null>;
    findByTag(tag: string): Promise<Rack | null>;
    create(data: CreateRackInput): Promise<Rack>;
    update(id: number, data: UpdateRackInput): Promise<Rack | null>;
    delete(id: number): Promise<boolean>;
    findOccupiedSlots(rackId: number): Promise<number[]>;
    createAttachment(data: CreateAttachmentInput): Promise<RackAttachment>;  
    findAttachmentsByRackId(rackId: number): Promise<RackAttachment[]>;        
    findAttachmentById(id: number): Promise<RackAttachment | null>;            
    deleteAttachment(id: number): Promise<boolean>;                          
}
class RackRepository implements IRackRepository {
    private pool: Pool;

    constructor() {
        this.pool = db.getPool();
    }

    async findAll(): Promise<Rack[]> {
        const query = `
      SELECT id, tag, name, location, capacity, created_at, updated_at
      FROM racks
      ORDER BY created_at DESC
    `;
        const result = await this.pool.query(query);
        return result.rows;
    }

    async findById(id: number): Promise<Rack | null> {
        const query = `
      SELECT id, tag, name, location, capacity, created_at, updated_at
      FROM racks
      WHERE id = $1
    `;
        const result = await this.pool.query(query, [id]);
        return result.rows[0] || null;
    }

    async findByTag(tag: string): Promise<Rack | null> {
        const query = `
      SELECT id, tag, name, location, capacity, created_at, updated_at
      FROM racks
      WHERE tag = $1
    `;
        const result = await this.pool.query(query, [tag]);
        return result.rows[0] || null;
    }


    async findOccupiedSlots(rackId: number): Promise<number[]> {
        const query = `
        SELECT slot_position
        FROM equipment
        WHERE rack_id = $1
          AND slot_position IS NOT NULL
        ORDER BY slot_position ASC
    `;
        const result = await this.pool.query(query, [rackId]);
        return result.rows.map((row) => row.slot_position);
    }


    async create(data: CreateRackInput): Promise<Rack> {
        const query = `
      INSERT INTO racks (tag, name, location, capacity)
      VALUES ($1, $2, $3, $4)
      RETURNING id, tag, name, location, capacity, created_at, updated_at
    `;
        const values = [
            data.tag,
            data.name,
            data.location || null,
            data.capacity || 42,
        ];
        const result = await this.pool.query(query, values);
        return result.rows[0];
    }

    async update(id: number, data: UpdateRackInput): Promise<Rack | null> {
        const fields: string[] = [];
        const values: unknown[] = [];
        let paramCount = 1;

        if (data.tag !== undefined) {
            fields.push(`tag = $${paramCount++}`);
            values.push(data.tag);
        }
        if (data.name !== undefined) {
            fields.push(`name = $${paramCount++}`);
            values.push(data.name);
        }
        if (data.location !== undefined) {
            fields.push(`location = $${paramCount++}`);
            values.push(data.location);
        }
        if (data.capacity !== undefined) {
            fields.push(`capacity = $${paramCount++}`);
            values.push(data.capacity);
        }

        fields.push(`updated_at = NOW()`);
        values.push(id);

        const query = `
      UPDATE racks
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING id, tag, name, location, capacity, created_at, updated_at
    `;

        const result = await this.pool.query(query, values);
        return result.rows[0] || null;
    }

    async delete(id: number): Promise<boolean> {
        const query = `DELETE FROM racks WHERE id = $1`;
        const result = await this.pool.query(query, [id]);
        return (result.rowCount ?? 0) > 0;
    }


    async createAttachment(data: CreateAttachmentInput): Promise<RackAttachment> {
        const query = `
        INSERT INTO rack_attachments
            (rack_id, filename, original_name, file_path, file_size, uploaded_by)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
    `;
        const values = [
            data.rack_id,
            data.filename,
            data.original_name,
            data.file_path,
            data.file_size,
            data.uploaded_by,
        ];
        const result = await this.pool.query(query, values);
        return result.rows[0];
    }

    async findAttachmentsByRackId(rackId: number): Promise<RackAttachment[]> {
        const query = `
        SELECT
            ra.*,
            u.username AS uploaded_by_username
        FROM rack_attachments ra
        LEFT JOIN users u ON ra.uploaded_by = u.id
        WHERE ra.rack_id = $1
        ORDER BY ra.created_at DESC
    `;
        const result = await this.pool.query(query, [rackId]);
        return result.rows;
    }

    async findAttachmentById(id: number): Promise<RackAttachment | null> {
        const query = `
        SELECT * FROM rack_attachments WHERE id = $1
    `;
        const result = await this.pool.query(query, [id]);
        return result.rows[0] || null;
    }

    async deleteAttachment(id: number): Promise<boolean> {
        const query = `DELETE FROM rack_attachments WHERE id = $1`;
        const result = await this.pool.query(query, [id]);
        return (result.rowCount ?? 0) > 0;
    }
}

export default new RackRepository();