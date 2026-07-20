export interface AuthUser {
    id: number;
    username: string;
    email: string;
    createdAt?: Date;
}
export interface TokenPair {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
}
export interface AuthResult {
    user: AuthUser;
    tokens: TokenPair;
}
export interface RefreshTokenRecord {
    jti: string;
    userId: number;
    expiresAt: Date;
    revoked: boolean;
}
export interface JwtAccessPayload {
    userId: number;
    type: 'access';
    iat: number;
    exp: number;
}
export interface JwtRefreshPayload {
    userId: number;
    type: 'refresh';
    jti: string;
    iat: number;
    exp: number;
}
//# sourceMappingURL=auth.types.d.ts.map