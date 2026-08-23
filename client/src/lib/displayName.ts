/**
 * Returns a display-friendly name from a username.
 * If the username looks like an email (contains @), returns just the part before @.
 * Otherwise returns the username as-is.
 */
export function displayName(username: string | undefined | null): string {
  if (!username) return 'Reader';
  if (username.includes('@')) {
    return username.split('@')[0];
  }
  return username;
}

/**
 * Returns a clean initial letter for the avatar.
 * If username starts with numbers or symbols, finds the first alphabetic letter.
 * e.g., "18dakshsuri" -> "D", "alice_reads" -> "A"
 */
export function userInitial(username: string | undefined | null): string {
  if (!username) return 'R';
  const clean = displayName(username);
  const letterMatch = clean.match(/[a-zA-Z]/);
  if (letterMatch) {
    return letterMatch[0].toUpperCase();
  }
  return clean.charAt(0).toUpperCase();
}

/**
 * Deterministic color generator matching Google / Gmail Account profile colors.
 * Maps user account (username / email) consistently to Google's official Material avatar colors.
 */
export function getAvatarColor(identifier: string | undefined | null): string {
  if (!identifier) return '#1a73e8'; // Google Blue default
  
  // Google Account Material Avatar Color Palette
  const googleColors = [
    '#1a73e8', // Google Classic Blue
    '#1e88e5', // Google Vivid Blue
    '#2563eb', // Royal Blue
    '#0288d1', // Light Blue
    '#00897b', // Teal
    '#2e7d32', // Forest Green
    '#16a34a', // Emerald
    '#e65100', // Amber Orange
    '#d84315', // Deep Orange
    '#c62828', // Crimson Red
    '#ad1457', // Ruby Pink
    '#6a1b9a', // Purple
    '#4527a0', // Deep Violet
    '#3949ab', // Royal Indigo
  ];

  let hash = 0;
  const clean = identifier.toLowerCase().trim();
  for (let i = 0; i < clean.length; i++) {
    hash = clean.charCodeAt(i) + ((hash << 5) - hash);
  }
  return googleColors[Math.abs(hash) % googleColors.length];
}
