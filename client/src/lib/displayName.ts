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
