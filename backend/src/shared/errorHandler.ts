import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { ApiResponse } from './types';
import multer from 'multer';

export class AppError extends Error {
    constructor(
        public statusCode: number,
        public message: string,
        public errors?: Array<{ field?: string; message: string }>
    ) {
        super(message);
        this.name = 'AppError';
    }
}

export const errorHandler = ( err: Error,_req: Request, res: Response, _next: NextFunction): void => {
    console.error('Error:', err);

    // Handle Zod validation errors
    if (err instanceof ZodError) {
        const response: ApiResponse = {
            success: false,
            message: 'Validation failed',
            errors: err.errors.map((e) => ({
                field: e.path.join('.'),
                message: e.message,
            })),
        };
        res.status(400).json(response);
        return;
    }
    // Handle Multer file upload errors
    if (err instanceof multer.MulterError) {
        const messages: Record<string, string> = {
            LIMIT_FILE_SIZE: 'File too large. Maximum size is 5MB',
            LIMIT_FILE_COUNT: 'Only one file can be uploaded at a time',
            LIMIT_UNEXPECTED_FILE: 'Unexpected file field. Use field name "file"',
        };

        const response: ApiResponse = {
            success: false,
            message: messages[err.code] || 'File upload error',
            errors: [{ message: err.message }],
        };
        res.status(400).json(response);
        return;
    }

    // Handle custom fileFilter error (wrong MIME type)
    if (err.message === 'Only PDF files are allowed') {
        const response: ApiResponse = {
            success: false,
            message: 'Invalid file type. Only PDF files are allowed',
        };
        res.status(400).json(response);
        return;
    }
    // Handle custom AppError
    if (err instanceof AppError) {
        const response: ApiResponse = {
            success: false,
            message: err.message,
            errors: err.errors,
        };
        console.log('heyyyyyy AppError:', response);
        res.status(err.statusCode).json(response);
        return;
    }

    // Handle database errors
    if (err.message.includes('duplicate key value')) {
        const response: ApiResponse = {
            success: false,
            message: 'A record with this unique identifier already exists',
            errors: [{ message: 'Duplicate entry detected' }],
        };
        res.status(409).json(response);
        return;
    }

    // Default error
    const response: ApiResponse = {
        success: false,
        message: 'Internal server error',
    };
    res.status(500).json(response);
};