import db from '../../src/shared/db';

export const cleanRacks = async (): Promise<void> => {
    await db.getPool().query(
        `DELETE FROM racks WHERE tag LIKE 'TEST-%'`
    );
};

export const cleanEquipment = async (): Promise<void> => {
    await db.getPool().query(
        `DELETE FROM equipment WHERE tag LIKE 'TEST-%'`
    );
};

export const cleanWarnings = async (): Promise<void> => {
    await db.getPool().query(
        `DELETE FROM warnings WHERE rack_tag LIKE 'TEST-%'`
    );
};

export const createTestRack = async (tag = 'TEST-R1'): Promise<number> => {
    const result = await db.getPool().query(
        `INSERT INTO racks (tag, name, location, capacity)
         VALUES ($1, $2, $3, $4)
         RETURNING id`,
        [tag, 'Test Rack', 'Test Location', 42]
    );
    return result.rows[0].id;
};

export const createTestEquipment = async (
    tag = 'TEST-E1',
    rackId?: number
): Promise<number> => {
    const result = await db.getPool().query(
        `INSERT INTO equipment (tag, name, type, rack_id)
         VALUES ($1, $2, $3, $4)
         RETURNING id`,
        [tag, 'Test Equipment', 'server', rackId || null]
    );
    return result.rows[0].id;
};