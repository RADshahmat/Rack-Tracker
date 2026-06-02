import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import authRepository, { IAuthRepository } from './auth.repository';
import { PublicUser, JwtPayload, LoginInput } from './auth.types';
import { AppError } from '../../shared/errorHandler';

class AuthService {
    private repository: IAuthRepository;

    constructor(repository: IAuthRepository) {
        this.repository = repository;
    }

    async login(data: LoginInput): Promise<{ user: PublicUser; token: string }> {
        const user = await this.repository.findByUsername(data.username);

        // Same error for wrong username or wrong password
        // prevents username enumeration attack
        if (!user) {
            throw new AppError(401, 'Invalid username or password');
        }

        const passwordMatch = await bcrypt.compare(data.password, user.password);
        if (!passwordMatch) {
            throw new AppError(401, 'Invalid username or password');
        }

        const payload: JwtPayload = {
            userId: user.id,
            username: user.username,
            role: user.role,
        };

        const token = jwt.sign(
            { ...payload }, // Spreading into a fresh object satisfies the type checker
            process.env.JWT_SECRET as string,
            {
                expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as jwt.SignOptions['expiresIn'],
            }
        );

        const publicUser: PublicUser = {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
        };

        return { user: publicUser, token };
    }

    async getMe(userId: number): Promise<PublicUser> {
        const user = await this.repository.findById(userId);
        if (!user) {
            throw new AppError(401, 'User not found');
        }

        return {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
        };
    }
}

export default new AuthService(authRepository);