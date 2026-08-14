import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));
const CONFIG_DIR = join(__dirname, '..', 'config');
let calibration = null;
let badges = null;
export function loadCalibration() {
    if (!calibration) {
        const raw = readFileSync(join(CONFIG_DIR, 'calibration_v1.json'), 'utf-8');
        calibration = JSON.parse(raw);
    }
    return calibration;
}
export function loadBadges() {
    if (!badges) {
        const raw = readFileSync(join(CONFIG_DIR, 'badges_v1.json'), 'utf-8');
        badges = JSON.parse(raw);
    }
    return badges;
}
export function getCalibrationVersion() {
    return loadCalibration().version;
}
export function getBadgeVersion() {
    return loadBadges().version;
}
//# sourceMappingURL=DnaConfig.js.map