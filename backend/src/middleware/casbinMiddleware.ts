import { Request, Response, NextFunction } from 'express';
import { checkPermission } from '../casbin/enforcer';

export const casbinMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    const user = req.user;

    if (!user) {
        res.status(401).json({
            success: false,
            message: 'Authentication required',
        });
        return;
    }

    const role = user.role;
    const method = req.method;

    // req.path is stripped of prefix — use originalUrl instead
    // strip query string from originalUrl
    const rawPath = req.originalUrl.split('?')[0];
    const normalizedPath = normalizePath(rawPath);

    // 🔍 Temporary debug log — remove after fixing
    console.log(`[Casbin] role=${role} path=${normalizedPath} method=${method}`);

    try {
        const allowed = await checkPermission(role, normalizedPath, method);

        console.log(`[Casbin] allowed=${allowed}`); // 🔍 debug

        if (!allowed) {
            res.status(403).json({
                success: false,
                message: 'You do not have permission to perform this action',
            });
            return;
        }

        next();
    } catch (error) {
        console.error('Casbin error:', error);
        res.status(500).json({
            success: false,
            message: 'Authorization check failed',
        });
    }
};

function normalizePath(path: string): string {
    return path
        .replace(/\/rack\/\d+/g, '/rack/:rackId')   // /equipment/rack/5 → /equipment/rack/:rackId
        .replace(/\/\d+/g, '/:id')                  // /42 → /:id
        .replace(/\/$/, '');                         // strip trailing slash
}