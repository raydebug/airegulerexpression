/**
 * Generates a unique ID
 */
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

/**
 * Formats a date string from a timestamp
 */
export function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Parses a regex pattern string and extracts the body and flags
 */
export function parseRegexPattern(pattern: string): { body: string; flags: string } | null {
  const match = pattern.match(/^\/(.*)\/([a-z]*)$/);
  if (!match) return null;
  
  const [, body, flags] = match;
  return { body, flags };
}

/**
 * Creates a regex object from a pattern string
 */
export function createRegexFromPattern(pattern: string): RegExp | null {
  try {
    const parsed = parseRegexPattern(pattern);
    if (!parsed) return null;
    
    return new RegExp(parsed.body, parsed.flags);
  } catch (error) {
    return null;
  }
}

/**
 * Checks if a regex pattern is valid
 */
export function isValidRegex(pattern: string): boolean {
  try {
    if (!pattern.startsWith('/')) return false;
    
    const parsed = parseRegexPattern(pattern);
    if (!parsed) return false;
    
    // This will throw if the pattern is invalid
    new RegExp(parsed.body, parsed.flags);
    return true;
  } catch (error) {
    return false;
  }
} 