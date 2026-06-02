import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';
import { v4 as uuidv4 } from 'uuid';

// Ensure uploads directory exists
const UPLOAD_DIR = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, UPLOAD_DIR);
    },
    filename: (_req, _file, cb) => {
        // NEVER use user-supplied filename — always UUID
        // D3 Exemplary requirement
        const uuidFilename = `${uuidv4()}.pdf`;
        cb(null, uuidFilename);
    },
});

const fileFilter = (
    _req: Request,
    file: Express.Multer.File,
    cb: FileFilterCallback
): void => {
    const allowedMimeTypes = ['application/pdf'];
    const allowedExtensions = ['.pdf'];
    const ext = path.extname(file.originalname).toLowerCase();

    if (
        allowedMimeTypes.includes(file.mimetype) &&
        allowedExtensions.includes(ext)
    ) {
        cb(null, true);
    } else {
        cb(new Error('Only PDF files are allowed'));
    }
};

export const uploadMiddleware = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB cap
        files: 1,                   // one file per request
    },
});