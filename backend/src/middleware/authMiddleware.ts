import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JwtPayload } from '../modules/auth/auth.types';

export const authMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    const token = req.cookies?.token;

    if (!token) {
        res.status(401).json({
            success: false,
            message: 'Authentication required',
        });
        return;
    }

    try {
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET as string
        ) as JwtPayload;

        req.user = decoded;
        next();
    } catch (error) {
        // Clear invalid cookie
        res.clearCookie('token');
        res.status(401).json({
            success: false,
            message: 'Invalid or expired session. Please log in again.',
        });
    }
};