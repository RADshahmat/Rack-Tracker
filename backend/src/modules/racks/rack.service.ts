import fs from 'fs';
import rackRepository, { IRackRepository } from './rack.repository';
import { Rack, CreateRackInput, UpdateRackInput, RackAttachment } from './rack.types';
import { AppError } from '../../shared/errorHandler';
import { racksCreatedTotal } from '../../metrics/registry';

class RackService {
    private repository: IRackRepository;

    constructor(repository: IRackRepository) {
        this.repository = repository;
    }

    async getAllRacks(): Promise<Rack[]> {
        return await this.repository.findAll();
    }

    async getRackById(id: number): Promise<Rack> {
        const rack = await this.repository.findById(id);
        if (!rack) {
            throw new AppError(404, `Rack with ID ${id} not found`);
        }
        return rack;
    }

    async getRackSlots(rackId: number): Promise<{
        total: number;
        occupied: number[];
        available: number[];
        occupiedCount: number;
        availableCount: number;
    }> {
        const rack = await this.repository.findById(rackId);
        if (!rack) {
            throw new AppError(404, `Rack with ID ${rackId} not found`);
        }

        const occupiedSlots = await this.repository.findOccupiedSlots(rackId);

        const allSlots = Array.from({ length: rack.capacity }, (_, i) => i + 1);
        const occupiedSet = new Set(occupiedSlots);
        const availableSlots = allSlots.filter((slot) => !occupiedSet.has(slot));

        return {
            total: rack.capacity,
            occupied: occupiedSlots,
            available: availableSlots,
            occupiedCount: occupiedSlots.length,
            availableCount: availableSlots.length,
        };
    }

    async createRack(data: CreateRackInput): Promise<Rack> {
        // Check for duplicate tag
        const existing = await this.repository.findByTag(data.tag);
        if (existing) {
            throw new AppError(400, 'Tag already exists', [
                { field: 'tag', message: `A rack with tag "${data.tag}" already exists` },
            ]);
        }
        const rack = await this.repository.create(data);

        // Increment counter after successful creation
        racksCreatedTotal.inc();

        return rack;
    }

    async updateRack(id: number, data: UpdateRackInput): Promise<Rack> {
        // Check if rack exists
        const existing = await this.repository.findById(id);
        if (!existing) {
            throw new AppError(404, `Rack with ID ${id} not found`);
        }

        // Check for duplicate tag if updating tag
        if (data.tag && data.tag !== existing.tag) {
            const tagExists = await this.repository.findByTag(data.tag);
            if (tagExists) {
                throw new AppError(400, 'Tag already exists', [
                    { field: 'tag', message: `A rack with tag "${data.tag}" already exists` },
                ]);
            }
        }

        const updated = await this.repository.update(id, data);
        if (!updated) {
            throw new AppError(500, 'Failed to update rack');
        }
        return updated;
    }

    async deleteRack(id: number): Promise<void> {
        const existing = await this.repository.findById(id);
        if (!existing) {
            throw new AppError(404, `Rack with ID ${id} not found`);
        }

        const deleted = await this.repository.delete(id);
        if (!deleted) {
            throw new AppError(500, 'Failed to delete rack');
        }
    }

    async uploadAttachment(
        rackId: number,
        file: Express.Multer.File,
        uploadedBy: number
    ): Promise<RackAttachment> {
        // Verify rack exists
        const rack = await this.repository.findById(rackId);
        if (!rack) {
            // Clean up uploaded file since rack doesn't exist
            this.deleteFileFromDisk(file.path);
            throw new AppError(404, `Rack with ID ${rackId} not found`);
        }

        return await this.repository.createAttachment({
            rack_id: rackId,
            filename: file.filename,            // UUID name
            original_name: file.originalname,   // user's name
            file_path: file.path,
            file_size: file.size,
            uploaded_by: uploadedBy,
        });
    }

    async getAttachments(rackId: number): Promise<RackAttachment[]> {
        const rack = await this.repository.findById(rackId);
        if (!rack) {
            throw new AppError(404, `Rack with ID ${rackId} not found`);
        }
        return await this.repository.findAttachmentsByRackId(rackId);
    }

    async deleteAttachment(attachmentId: number, userId: number, role: string): Promise<void> {
        const attachment = await this.repository.findAttachmentById(attachmentId);
        if (!attachment) {
            throw new AppError(404, `Attachment with ID ${attachmentId} not found`);
        }

        // Only admin or the uploader can delete
        if (role !== 'admin' && attachment.uploaded_by !== userId) {
            throw new AppError(403, 'You do not have permission to delete this attachment');
        }

        await this.repository.deleteAttachment(attachmentId);
        this.deleteFileFromDisk(attachment.file_path);
    }

    private deleteFileFromDisk(filePath: string): void {
        try {
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        } catch (err) {
            // Log but don't throw — DB record is source of truth
            console.error(`Failed to delete file from disk: ${filePath}`, err);
        }
    }
}

export default new RackService(rackRepository);