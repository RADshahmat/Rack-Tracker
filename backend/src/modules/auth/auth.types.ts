export interface User {
    id: number;
    username: string;
    email: string;
    password: string;
    role: 'admin' | 'operator' | 'viewer';
    created_at: Date;
    updated_at: Date;
}

export interface PublicUser {
    id: number;
    username: string;
    email: string;
    role: 'admin' | 'operator' | 'viewer';
}

export interface JwtPayload {
    userId: number;
    username: string;
    role: 'admin' | 'operator' | 'viewer';
}

export interface LoginInput {
    username: string;
    password: string;
}