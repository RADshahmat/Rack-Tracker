import { z } from 'zod';
const EQUIPMENT_TYPES = ['server', 'switch', 'router', 'database', 'firewall', 'pdu'] as const;
export const createEquipmentSchema = z.object({
    tag: z
        .string()
        .min(1, 'Tag is required')
        .max(50, 'Tag must be 50 characters or less')
        .regex(/^[A-Z0-9-]+$/, 'Tag must contain only uppercase letters, numbers, and hyphens'),
    name: z
        .string()
        .min(1, 'Name is required')
        .max(100, 'Name must be 100 characters or less'),
    type: z
        .enum(EQUIPMENT_TYPES, {
            errorMap: () => ({ message: 'Invalid hardware infrastructure classification selection' })
        }),
    rack_id: z
        .number()
        .int('Rack ID must be an integer')
        .positive('Rack ID must be positive')
        .nullable()
        .optional()
       ,
    slot_position: z
        .number()
        .int('Slot position must be an integer')
        .min(1, 'Slot position must be at least 1')
        .max(100, 'Slot position must be 100 or less')
        .nullable()
        .optional(),
});

export const updateEquipmentSchema = z.object({
    tag: z
        .string()
        .min(1, 'Tag cannot be empty')
        .max(50, 'Tag must be 50 characters or less')
        .regex(/^[A-Z0-9-]+$/, 'Tag must contain only uppercase letters, numbers, and hyphens')
        .optional(),
    name: z
        .string()
        .min(1, 'Name cannot be empty')
        .max(100, 'Name must be 100 characters or less')
        .optional(),
    type: z
        .enum(EQUIPMENT_TYPES, {
            errorMap: () => ({ message: 'Invalid hardware infrastructure classification selection' })
        })
        .optional(),
    rack_id: z
        .number()
        .int('Rack ID must be an integer')
        .positive('Rack ID must be positive')
        .nullable()
        .optional(),
    slot_position: z
        .number()
        .int('Slot position must be an integer')
        .min(1, 'Slot position must be at least 1')
        .max(100, 'Slot position must be 100 or less')
        .nullable()
        .optional(),
}).refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update',
});

export type CreateEquipmentSchema = z.infer<typeof createEquipmentSchema>;
export type UpdateEquipmentSchema = z.infer<typeof updateEquipmentSchema>;