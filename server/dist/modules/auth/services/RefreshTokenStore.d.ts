export declare class RefreshTokenStore {
    save(record: {
        jti: string;
        userId: number;
        expiresAt: Date;
        revoked: boolean;
    }): Promise<void>;
    findByJti(jti: string): Promise<{
        jti: string;
        userId: number;
        expiresAt: Date;
        revoked: boolean;
    } | null>;
    revoke(jti: string): Promise<void>;
    revokeAllForUser(userId: number): Promise<void>;
    cleanupExpired(): Promise<number>;
}
//# sourceMappingURL=RefreshTokenStore.d.ts.map