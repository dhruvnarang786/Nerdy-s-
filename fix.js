const fs = require('fs');
const path = require('path');
const file = path.join('c:/Users/Dhruv/Desktop/projects/nerdys', 'client/src/styles/pages.css');
let buffer = fs.readFileSync(file);
let text;
if (buffer.indexOf(0) !== -1) {
    text = buffer.toString('utf16le');
} else {
    text = buffer.toString('utf8');
}
text = text.replace(/\0/g, '');
let parts = text.split('.hero-floating-books');
let cleanText = parts[0] + `
/* Dark Academia Depth Additions */
.hero-gradient-bg {
    background: linear-gradient(135deg, rgba(26, 22, 20, 0.95) 0%, rgba(10, 8, 7, 0.95) 100%) !important;
}

.hero-noise-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    opacity: 0.15;
    pointer-events: none;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
    z-index: 1;
}

.hero-radial-glow {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 80%;
    height: 80%;
    background: radial-gradient(circle, rgba(124, 58, 237, 0.12) 0%, transparent 60%);
    pointer-events: none;
    z-index: 1;
}

/* Elegant Bounded Stat Badges */
.da-stat-box {
    background: rgba(44, 34, 46, 0.35); /* Dark background with subtle tint */
    backdrop-filter: blur(12px);
    border: 1px solid rgba(124, 58, 237, 0.25);
    border-radius: 9999px; /* Pill shape */
    padding: 1rem 2.5rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.25rem;
    box-shadow: 0 8px 32px rgba(124, 58, 237, 0.15), inset 0 0 20px rgba(124, 58, 237, 0.05);
    transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
    cursor: default; /* Not a clickable button */
}

.da-stat-box:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 40px rgba(124, 58, 237, 0.25), inset 0 0 25px rgba(124, 58, 237, 0.08);
    border-color: rgba(124, 58, 237, 0.4);
}

.da-stat-num {
    font-size: 2.2rem;
    font-weight: 800;
    color: #f3f4f6; /* Premium light text */
    letter-spacing: -0.02em;
    line-height: 1;
    text-shadow: 0 0 15px rgba(255, 255, 255, 0.2);
}

.da-stat-lbl {
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: rgba(229, 231, 235, 0.7); /* Muted contrast */
    font-weight: 600;
}
`;
fs.writeFileSync(file, cleanText, 'utf8');
console.log('Fixed css file encoding and added new styles!');
