import { Request, Response, NextFunction } from 'express';
import warningRepository from './warning.repository';
import { ApiResponse } from '../../shared/types';

class WarningController {
    async getAll(_req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const warnings = await warningRepository.findAll();
            const response: ApiResponse = {
                success: true,
                message: 'Warnings retrieved successfully',
                data: warnings,
            };
            res.status(200).json(response);
        } catch (error) {
            next(error);
        }
    }

    async getUnresolved(_req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const warnings = await warningRepository.findUnresolved();
            const response: ApiResponse = {
                success: true,
                message: 'Unresolved warnings retrieved successfully',
                data: warnings,
            };
            res.status(200).json(response);
        } catch (error) {
            next(error);
        }
    }

    async resolve(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid warning ID',
                });
                return;
            }

            const resolved = await warningRepository.markResolved(id);
            if (!resolved) {
                res.status(404).json({
                    success: false,
                    message: `Warning with ID ${id} not found`,
                });
                return;
            }

            const response: ApiResponse = {
                success: true,
                message: 'Warning resolved successfully',
            };
            res.status(200).json(response);
        } catch (error) {
            next(error);
        }
    }
}

export default new WarningController();