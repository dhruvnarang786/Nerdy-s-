/**
 * SvgCoverGenerator
 * Procedurally generates Dark Academia styled typographic book covers for books
 * that lack official digital cover art in external catalogs.
 */

// Curated Dark Academia leather / linen color palettes
const PALETTES = [
  { bg: '#161d18', text: '#e6dfd3', gold: '#d4af37', accent: '#233226', border: '#b8972e' }, // Forest Emerald & Antique Gold
  { bg: '#1c1318', text: '#f3ede2', gold: '#dfb743', accent: '#2d1c25', border: '#c99e32' }, // Crimson Burgundy & Gold
  { bg: '#121722', text: '#e8edf5', gold: '#d4af37', accent: '#1b2434', border: '#b5932b' }, // Midnight Oxford Blue
  { bg: '#1a1815', text: '#f0ece1', gold: '#cda83b', accent: '#2a2620', border: '#ba9429' }, // Espresso Leather & Gold
  { bg: '#141416', text: '#e4e2de', gold: '#d4af37', accent: '#222226', border: '#a8892d' }, // Obsidian Slate
];

function escapeXml(unsafe) {
  if (!unsafe) return '';
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function wrapText(text, maxCharsPerLine = 18, maxLines = 4) {
  if (!text) return [];
  const words = text.split(/\s+/);
  const lines = [];
  let currentLine = '';

  for (const word of words) {
    if ((currentLine + ' ' + word).trim().length <= maxCharsPerLine) {
      currentLine = (currentLine + ' ' + word).trim();
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
      if (lines.length >= maxLines - 1) break;
    }
  }
  if (currentLine && lines.length < maxLines) {
    lines.push(currentLine);
  }
  if (words.length > 0 && lines.length === maxLines && currentLine !== words[words.length - 1]) {
    lines[lines.length - 1] += '...';
  }
  return lines;
}

export function generateSvgCover(title = 'Untitled Book', author = 'Unknown Author') {
  const safeTitle = title || 'Untitled Work';
  const safeAuthor = author || 'Anonymous';
  const paletteIndex = hashString(safeTitle + safeAuthor) % PALETTES.length;
  const p = PALETTES[paletteIndex];

  const titleLines = wrapText(safeTitle, 16, 4);
  const authorLines = wrapText(safeAuthor, 22, 2);

  const titleStartY = 210 - (titleLines.length - 1) * 16;
  const authorStartY = 390;

  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 480" width="320" height="480">
  <defs>
    <!-- Rich leather background gradient -->
    <linearGradient id="bgGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${p.accent}" />
      <stop offset="50%" stop-color="${p.bg}" />
      <stop offset="100%" stop-color="${p.bg}" />
    </linearGradient>

    <!-- Spine shadow overlay for book depth -->
    <linearGradient id="spineShadow" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="rgba(0,0,0,0.65)" />
      <stop offset="4%" stop-color="rgba(255,255,255,0.08)" />
      <stop offset="7%" stop-color="rgba(0,0,0,0.4)" />
      <stop offset="12%" stop-color="transparent" />
      <stop offset="97%" stop-color="transparent" />
      <stop offset="100%" stop-color="rgba(0,0,0,0.35)" />
    </linearGradient>

    <!-- Gold metallic gradient -->
    <linearGradient id="goldGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#fdf2c4" />
      <stop offset="35%" stop-color="${p.gold}" />
      <stop offset="70%" stop-color="${p.border}" />
      <stop offset="100%" stop-color="#9a761e" />
    </linearGradient>
  </defs>

  <!-- Background Base -->
  <rect width="320" height="480" fill="url(#bgGrad)" />

  <!-- Textured border frames -->
  <rect x="16" y="16" width="288" height="448" fill="none" stroke="url(#goldGrad)" stroke-width="1.5" opacity="0.85" rx="3" />
  <rect x="22" y="22" width="276" height="436" fill="none" stroke="${p.gold}" stroke-width="0.75" opacity="0.4" stroke-dasharray="3,3" />

  <!-- Corner Flourishes -->
  <g stroke="${p.gold}" stroke-width="1.2" fill="none" opacity="0.8">
    <!-- Top-Left -->
    <path d="M 28 40 L 40 40 L 40 28" />
    <circle cx="40" cy="40" r="1.5" fill="${p.gold}" />
    <!-- Top-Right -->
    <path d="M 292 40 L 280 40 L 280 28" />
    <circle cx="280" cy="40" r="1.5" fill="${p.gold}" />
    <!-- Bottom-Left -->
    <path d="M 28 440 L 40 440 L 40 452" />
    <circle cx="40" cy="440" r="1.5" fill="${p.gold}" />
    <!-- Bottom-Right -->
    <path d="M 292 440 L 280 440 L 280 452" />
    <circle cx="280" cy="440" r="1.5" fill="${p.gold}" />
  </g>

  <!-- Header Brand Mark -->
  <g transform="translate(160, 75)" text-anchor="middle">
    <!-- Ornate top crown / emblem -->
    <path d="M -18 -8 L -6 -2 L 0 -12 L 6 -2 L 18 -8 L 12 6 L -12 6 Z" fill="none" stroke="url(#goldGrad)" stroke-width="1.2" />
    <circle cx="0" cy="-2" r="2" fill="${p.gold}" />
    <text y="24" font-family="'Cinzel', 'Playfair Display', Georgia, serif" font-size="8.5" letter-spacing="3.5" fill="${p.gold}" opacity="0.85">NERDY'S CODEX</text>
  </g>

  <!-- Divider Line Top -->
  <line x1="80" y1="120" x2="240" y2="120" stroke="url(#goldGrad)" stroke-width="1" opacity="0.5" />
  <polygon points="160,117 163,120 160,123 157,120" fill="${p.gold}" />

  <!-- Book Title -->
  <g text-anchor="middle">
    ${titleLines
      .map(
        (line, idx) => `
      <text
        x="160"
        y="${titleStartY + idx * 30}"
        font-family="'Playfair Display', 'Cinzel', Georgia, serif"
        font-size="${titleLines.length > 2 ? 20 : 23}"
        font-weight="700"
        fill="${p.text}"
        letter-spacing="0.5"
      >${escapeXml(line)}</text>`
      )
      .join('')}
  </g>

  <!-- Divider Line Bottom -->
  <line x1="100" y1="345" x2="220" y2="345" stroke="url(#goldGrad)" stroke-width="1" opacity="0.5" />
  <circle cx="160" cy="345" r="2" fill="${p.gold}" />

  <!-- Author Name -->
  <g text-anchor="middle">
    <text x="160" y="372" font-family="'Cinzel', Georgia, serif" font-size="8.5" letter-spacing="2.5" fill="${p.gold}" opacity="0.75">AUTHOR</text>
    ${authorLines
      .map(
        (line, idx) => `
      <text
        x="160"
        y="${authorStartY + idx * 20}"
        font-family="'Playfair Display', Georgia, serif"
        font-size="14"
        font-style="italic"
        fill="${p.text}"
        opacity="0.95"
      >${escapeXml(line)}</text>`
      )
      .join('')}
  </g>

  <!-- Book spine 3D shading -->
  <rect width="320" height="480" fill="url(#spineShadow)" pointer-events="none" />
</svg>
`.trim();
}
