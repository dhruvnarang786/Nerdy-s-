export function computeCountryDiversity(logs, authorCountryMap) {
    if (!logs || logs.length === 0)
        return null;
    const countryCounts = {};
    let resolvableCount = 0;
    let unresolvableCount = 0;
    for (const log of logs) {
        const author = (log.author || '').trim().toLowerCase();
        if (!author)
            continue;
        const country = authorCountryMap[author];
        if (country && country !== 'UNKNOWN') {
            countryCounts[country] = (countryCounts[country] || 0) + 1;
            resolvableCount++;
        }
        else {
            unresolvableCount++;
        }
    }
    const totalAuthors = resolvableCount + unresolvableCount;
    if (totalAuthors === 0)
        return null;
    if (unresolvableCount / totalAuthors > 0.5)
        return null;
    const uniqueCountries = Object.keys(countryCounts).length;
    if (uniqueCountries === 0)
        return null;
    const values = Object.values(countryCounts);
    const totalResolvable = values.reduce((s, v) => s + v, 0);
    const avgPerCountry = totalResolvable / uniqueCountries;
    const maxPerCountry = Math.max(...values);
    const evennessBonus = 1 - (avgPerCountry / maxPerCountry) * 0.3;
    const raw = Math.min(uniqueCountries / 10, 1) * 100 * evennessBonus;
    return Math.round(raw);
}
//# sourceMappingURL=countryDiversity.js.map