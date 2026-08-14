export function computeDiscoveryScore(accum, totalLogs) {
    const { obscureCount = 0 } = accum || {};
    if (totalLogs === 0)
        return { score: null, accum };
    const smoothing = totalLogs < 10 ? (1 - ((10 - totalLogs) / 10) * 0.2) : 1;
    const raw = (obscureCount / totalLogs) * 100 * smoothing;
    return { score: Math.round(raw), accum };
}
export function applyDiscoveryDelta(accum, _log, isCreate, isObscure) {
    const a = { ...(accum || { obscureCount: 0 }) };
    if (isCreate && isObscure)
        a.obscureCount++;
    if (!isCreate && isObscure)
        a.obscureCount = Math.max(0, a.obscureCount - 1);
    return a;
}
//# sourceMappingURL=discoveryScore.js.map