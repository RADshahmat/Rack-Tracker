import fs from 'fs';
import { Request, Response, NextFunction } from 'express';
import rackService from './rack.service';
import { createRackSchema, updateRackSchema } from './rack.schema';
import { ApiResponse } from '../../shared/types';

class RackController {
    async getAll(_req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const racks = await rackService.getAllRacks();
            const response: ApiResponse = {
                success: true,
                message: 'Racks retrieved successfully',
                data: racks,
            };
            res.status(200).json(response);
        } catch (error) {
            next(error);
        }
    }

    async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid rack ID',
                });
                return;
            }

            const rack = await rackService.getRackById(id);
            const response: ApiResponse = {
                success: true,
                message: 'Rack retrieved successfully',
                data: rack,
            };
            res.status(200).json(response);
        } catch (error) {
            next(error);
        }
    }


    async getSlots(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid rack ID',
                });
                return;
            }

            const slots = await rackService.getRackSlots(id);
            const response: ApiResponse = {
                success: true,
                message: 'Rack slots retrieved successfully',
                data: slots,
            };
            res.status(200).json(response);
        } catch (error) {
            next(error);
        }
    }

    async create(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const validated = createRackSchema.parse(req.body);
            const rack = await rackService.createRack(validated);
            const response: ApiResponse = {
                success: true,
                message: 'Rack created successfully',
                data: rack,
            };
            res.status(201).json(response);
        } catch (error) {
            next(error);
        }
    }

    async update(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid rack ID',
                });
                return;
            }

            const validated = updateRackSchema.parse(req.body);
            const rack = await rackService.updateRack(id, validated);
            const response: ApiResponse = {
                success: true,
                message: 'Rack updated successfully',
                data: rack,
            };
            res.status(200).json(response);
        } catch (error) {
            next(error);
        }
    }

    async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid rack ID',
                });
                return;
            }

            await rackService.deleteRack(id);
            const response: ApiResponse = {
                success: true,
                message: 'Rack deleted successfully',
            };
            res.status(200).json(response);
        } catch (error) {
            next(error);
        }
    }


    async upload(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const rackId = parseInt(req.params.id, 10);
            if (isNaN(rackId)) {
                // Clean up file if ID is invalid
                if (req.file) fs.unlinkSync(req.file.path);
                res.status(400).json({
                    success: false,
                    message: 'Invalid rack ID',
                });
                return;
            }

            if (!req.file) {
                res.status(400).json({
                    success: false,
                    message: 'No file uploaded',
                });
                return;
            }

            const attachment = await rackService.uploadAttachment(
                rackId,
                req.file,
                req.user!.userId
            );

            const response: ApiResponse = {
                success: true,
                message: 'File uploaded successfully',
                data: attachment,
            };
            res.status(201).json(response);
        } catch (error) {
            // Clean up file on any error
            if (req.file) {
                try { fs.unlinkSync(req.file.path); } catch (_) { }
            }
            next(error);
        }
    }

    async getAttachments(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const rackId = parseInt(req.params.id, 10);
            if (isNaN(rackId)) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid rack ID',
                });
                return;
            }

            const attachments = await rackService.getAttachments(rackId);
            const response: ApiResponse = {
                success: true,
                message: 'Attachments retrieved successfully',
                data: attachments,
            };
            res.status(200).json(response);
        } catch (error) {
            next(error);
        }
    }

    async downloadAttachment( req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const rackId = parseInt(req.params.id, 10);
            const attachmentId = parseInt(req.params.attachmentId, 10);

            if (isNaN(rackId) || isNaN(attachmentId)) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid ID',
                });
                return;
            }

            const attachment = await rackService.getAttachmentFile(
                rackId,
                attachmentId
            );

            if (!fs.existsSync(attachment.file_path)) {
                res.status(404).json({
                    success: false,
                    message: 'File not found on disk',
                });
                return;
            }

            res.setHeader('Content-Type', 'application/pdf');

            // Browser opens PDF instead of downloading
            res.setHeader(
                'Content-Disposition',
                `inline; filename="${attachment.original_name}"`
            );

            res.sendFile(attachment.file_path);
        } catch (error) {
            next(error);
        }
    }

    async deleteAttachment(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const attachmentId = parseInt(req.params.attachmentId, 10);
            if (isNaN(attachmentId)) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid attachment ID',
                });
                return;
            }

            await rackService.deleteAttachment(
                attachmentId,
                req.user!.userId,
                req.user!.role
            );

            const response: ApiResponse = {
                success: true,
                message: 'Attachment deleted successfully',
            };
            res.status(200).json(response);
        } catch (error) {
            next(error);
        }
    }
}

export default new RackController();