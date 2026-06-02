import { Request, Response, NextFunction } from 'express';
import { checkPermission } from '../casbin/enforcer';

export const casbinMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    const user = req.user;

    // authMiddleware must run before this
    if (!user) {
        res.status(401).json({
            success: false,
            message: 'Authentication required',
        });
        return;
    }

    const role = user.role;
    const method = req.method;

    // Normalize path — strip query strings, replace numeric IDs
    // with :id so it matches the policy pattern
    // e.g. /api/racks/42/slots → /api/racks/:id/slots
    const normalizedPath = normalizePath(req.path);

    try {
        const allowed = await checkPermission(role, normalizedPath, method);

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

/**
 * Normalize Express path to match Casbin policy patterns.
 *
 * Rules:
 *  - Numeric segments → :id          /api/racks/42        → /api/racks/:id
 *  - rackId segment   → :rackId      /api/equipment/rack/5 → /api/equipment/rack/:rackId
 *  - Trailing slash stripped
 *
 * Examples:
 *  /api/racks/1/slots      → /api/racks/:id/slots
 *  /api/racks/1/upload     → /api/racks/:id/upload
 *  /api/equipment/rack/2   → /api/equipment/rack/:rackId
 *  /api/equipment/5        → /api/equipment/:id
 */
function normalizePath(path: string): string {
    return path
        .replace(/\/rack\/\d+/g, '/rack/:rackId')   // equipment/rack/5 → equipment/rack/:rackId
        .replace(/\/\d+/g, '/:id')                  // /42 → /:id
        .replace(/\/$/, '');                         // strip trailing slash
}