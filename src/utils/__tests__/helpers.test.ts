import { 
  generateId, 
  formatDate, 
  parseRegexPattern, 
  createRegexFromPattern, 
  isValidRegex 
} from '../helpers';

// Import Jest types
import { describe, it, expect } from '@jest/globals';

describe('Regex helper utilities', () => {
  describe('generateId', () => {
    it('should generate a unique ID', () => {
      const id1 = generateId();
      const id2 = generateId();
      expect(id1).toBeTruthy();
      expect(typeof id1).toBe('string');
      expect(id1).not.toEqual(id2);
    });
  });

  describe('formatDate', () => {
    it('should format a timestamp to a readable date', () => {
      const testDate = new Date(2023, 0, 15); // Jan 15, 2023
      const timestamp = testDate.getTime();
      const formatted = formatDate(timestamp);
      expect(formatted).toMatch(/Jan 15, 2023/);
    });
  });

  describe('parseRegexPattern', () => {
    it('should correctly parse a regex pattern string', () => {
      const result = parseRegexPattern('/abc[0-9]+/gi');
      expect(result).toEqual({
        body: 'abc[0-9]+',
        flags: 'gi'
      });
    });

    it('should return null for invalid pattern format', () => {
      const result = parseRegexPattern('abc[0-9]+');
      expect(result).toBeNull();
    });
  });

  describe('createRegexFromPattern', () => {
    it('should create a RegExp object from a pattern string', () => {
      const regex = createRegexFromPattern('/test[0-9]+/g');
      expect(regex).toBeInstanceOf(RegExp);
      expect(regex?.test('test123')).toBe(true);
      expect(regex?.test('abc')).toBe(false);
    });

    it('should return null for invalid patterns', () => {
      const regex = createRegexFromPattern('invalid');
      expect(regex).toBeNull();
    });
  });

  describe('isValidRegex', () => {
    it('should return true for valid regex patterns', () => {
      expect(isValidRegex('/abc[0-9]+/g')).toBe(true);
    });

    it('should return false for invalid regex patterns', () => {
      expect(isValidRegex('abc[0-9]+')).toBe(false);
      expect(isValidRegex('/abc[/g')).toBe(false);
    });
  });
}); 