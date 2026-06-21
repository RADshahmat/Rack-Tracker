import { Request, Response, NextFunction } from 'express';
import authService from './auth.service';
import { loginSchema } from './auth.schema';
import { ApiResponse } from '../../shared/types';
import { JwtPayload } from './auth.types';

// Extend Express Request to carry user payload
declare global {
    namespace Express {
        interface Request {
            user?: JwtPayload;
        }
    }
}

class AuthController {
    async login(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
           // console.log('Login request body:', req.body); // Debug log
            const validated = loginSchema.parse(req.body);
            const { user, token } = await authService.login(validated);
            // Set httpOnly cookie — never accessible from JS
            res.cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
            });

            const response: ApiResponse = {
                success: true,
                message: 'Login successful',
                data: user,
            };
            res.status(200).json(response);
        } catch (error) {
            next(error);
        }
    }

    async logout(_req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            res.clearCookie('token', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            });

            const response: ApiResponse = {
                success: true,
                message: 'Logout successful',
            };
            res.status(200).json(response);
        } catch (error) {
            next(error);
        }
    }

    async me(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            // req.user is attached by authMiddleware
            const user = await authService.getMe(req.user!.userId);

            const response: ApiResponse = {
                success: true,
                message: 'User retrieved successfully',
                data: user,
            };
            res.status(200).json(response);
        } catch (error) {
            next(error);
        }
    }
}

export default new AuthController();