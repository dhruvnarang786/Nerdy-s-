import type { RefreshTokenStore } from './RefreshTokenStore.js';
import type { AuthUser, AuthResult, TokenPair, JwtAccessPayload } from '../types/auth.types.js';
export declare class AuthService {
    private refreshTokenStore;
    constructor(refreshTokenStore: RefreshTokenStore);
    register(username: string, email: string, password: string): Promise<AuthResult>;
    login(email: string, password: string): Promise<AuthResult>;
    googleAuth(credential: string): Promise<AuthResult>;
    refreshToken(token: string): Promise<TokenPair>;
    logout(refreshToken: string): Promise<void>;
    logoutAll(userId: number): Promise<void>;
    getMe(userId: number): Promise<AuthUser | null>;
    verifyAccessToken(token: string): JwtAccessPayload;
    private generateTokenPair;
    private verifyRefreshToken;
    private fetchGoogleCerts;
    private verifyGoogleToken;
}
//# sourceMappingURL=AuthService.d.ts.map