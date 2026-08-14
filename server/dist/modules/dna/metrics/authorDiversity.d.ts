interface AuthorAccum {
    uniqueAuthors: number;
    totalLogs: number;
    authorLogMap: Record<string, number>;
}
export declare function computeAuthorDiversity(accum: AuthorAccum): {
    score: number;
    accum: AuthorAccum;
};
export declare function applyAuthorDelta(accum: AuthorAccum | undefined, log: {
    author?: string | null;
}, isCreate: boolean): AuthorAccum;
export {};
//# sourceMappingURL=authorDiversity.d.ts.map