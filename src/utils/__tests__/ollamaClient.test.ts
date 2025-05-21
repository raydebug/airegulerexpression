import { generateRegex, testRegex } from '../ollamaClient';

// Mock the ollama module
jest.mock('ollama', () => ({
  chat: jest.fn().mockImplementation(() => Promise.resolve({
    message: {
      content: '/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}/g',
    },
  })),
}));

describe('ollamaClient utilities', () => {
  describe('generateRegex', () => {
    it('should generate a regex pattern from a description', async () => {
      const result = await generateRegex({ description: 'match email addresses' });
      expect(result).toBe('/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}/g');
    });

    it('should add delimiters and flags if not present', async () => {
      // Mock the ollama response for this test only
      const ollamaMock = require('ollama');
      ollamaMock.chat.mockImplementationOnce(() => Promise.resolve({
        message: {
          content: '[a-zA-Z0-9]+',
        },
      }));

      const result = await generateRegex({ 
        description: 'match alphanumeric strings', 
        flags: 'gi' 
      });
      expect(result).toBe('/[a-zA-Z0-9]+/gi');
    });

    it('should clean up code blocks in response', async () => {
      // Mock the ollama response for this test only
      const ollamaMock = require('ollama');
      ollamaMock.chat.mockImplementationOnce(() => Promise.resolve({
        message: {
          content: '```regex\n/[0-9]{3}-[0-9]{3}-[0-9]{4}/g\n```',
        },
      }));

      const result = await generateRegex({ description: 'match phone numbers' });
      expect(result).toBe('/[0-9]{3}-[0-9]{3}-[0-9]{4}/g');
    });

    it('should throw an error when the API call fails', async () => {
      // Mock a rejection
      const ollamaMock = require('ollama');
      ollamaMock.chat.mockImplementationOnce(() => Promise.reject(new Error('API error')));

      await expect(generateRegex({ description: 'will fail' }))
        .rejects.toThrow('Failed to generate regex pattern');
    });
  });

  describe('testRegex', () => {
    it('should test a regex pattern against a string and return matches', () => {
      const testString = 'My email is test@example.com and my other email is another@example.org';
      const pattern = '/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}/g';
      
      const result = testRegex(pattern, testString);
      
      expect(result.isValid).toBe(true);
      expect(result.matches).toHaveLength(2);
      expect(result.matches).toEqual(['test@example.com', 'another@example.org']);
    });

    it('should return invalid status for incorrectly formatted patterns', () => {
      const result = testRegex('invalid-pattern', 'test string');
      
      expect(result.isValid).toBe(false);
      expect(result.matches).toHaveLength(0);
    });

    it('should return empty matches when no matches found', () => {
      const result = testRegex('/xyz/g', 'abc');
      
      expect(result.isValid).toBe(true);
      expect(result.matches).toHaveLength(0);
    });

    it('should handle invalid regex patterns gracefully', () => {
      // This is an invalid regex due to the unclosed character class
      const result = testRegex('/abc[/g', 'abc[123');
      
      expect(result.isValid).toBe(false);
      expect(result.matches).toHaveLength(0);
    });
  });
}); 