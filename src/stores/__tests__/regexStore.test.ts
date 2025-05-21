import { useRegexStore, RegexPattern } from '../regexStore';
import { act } from '@testing-library/react';

const createTestPattern = (overrides: Partial<RegexPattern> = {}): RegexPattern => ({
  id: 'test-id-1',
  name: 'Test Pattern',
  description: 'A test pattern',
  pattern: '/test[0-9]+/g',
  createdAt: 1622548800000, // 2021-06-01
  tags: ['test', 'example'],
  ...overrides,
});

describe('regexStore', () => {
  beforeEach(() => {
    // Clear the store before each test
    act(() => {
      useRegexStore.setState({
        patterns: [],
        currentPattern: null,
      });
    });
  });

  describe('addPattern', () => {
    it('should add a pattern to the store', () => {
      const pattern = createTestPattern();
      
      act(() => {
        useRegexStore.getState().addPattern(pattern);
      });

      expect(useRegexStore.getState().patterns).toHaveLength(1);
      expect(useRegexStore.getState().patterns[0]).toEqual(pattern);
    });
  });

  describe('setCurrentPattern', () => {
    it('should set the current pattern', () => {
      const pattern = createTestPattern();
      
      act(() => {
        useRegexStore.getState().setCurrentPattern(pattern);
      });

      expect(useRegexStore.getState().currentPattern).toEqual(pattern);
    });

    it('should set current pattern to null', () => {
      act(() => {
        useRegexStore.getState().setCurrentPattern(null);
      });

      expect(useRegexStore.getState().currentPattern).toBeNull();
    });
  });

  describe('updatePattern', () => {
    it('should update an existing pattern', () => {
      const pattern = createTestPattern();
      
      act(() => {
        useRegexStore.getState().addPattern(pattern);
      });

      const updates = {
        name: 'Updated Name',
        tags: ['updated', 'tags'],
      };

      act(() => {
        useRegexStore.getState().updatePattern(pattern.id, updates);
      });

      expect(useRegexStore.getState().patterns[0].name).toBe('Updated Name');
      expect(useRegexStore.getState().patterns[0].tags).toEqual(['updated', 'tags']);
      // Ensure other fields weren't changed
      expect(useRegexStore.getState().patterns[0].description).toBe(pattern.description);
    });

    it('should update the current pattern if it matches the updated pattern', () => {
      const pattern = createTestPattern();
      
      act(() => {
        useRegexStore.getState().addPattern(pattern);
        useRegexStore.getState().setCurrentPattern(pattern);
      });

      const updates = {
        name: 'Updated Name',
      };

      act(() => {
        useRegexStore.getState().updatePattern(pattern.id, updates);
      });

      expect(useRegexStore.getState().currentPattern?.name).toBe('Updated Name');
    });
  });

  describe('deletePattern', () => {
    it('should delete a pattern from the store', () => {
      const pattern1 = createTestPattern({ id: 'id1' });
      const pattern2 = createTestPattern({ id: 'id2' });
      
      act(() => {
        useRegexStore.getState().addPattern(pattern1);
        useRegexStore.getState().addPattern(pattern2);
      });

      expect(useRegexStore.getState().patterns).toHaveLength(2);

      act(() => {
        useRegexStore.getState().deletePattern('id1');
      });

      expect(useRegexStore.getState().patterns).toHaveLength(1);
      expect(useRegexStore.getState().patterns[0].id).toBe('id2');
    });

    it('should set current pattern to null if the deleted pattern is the current pattern', () => {
      const pattern = createTestPattern();
      
      act(() => {
        useRegexStore.getState().addPattern(pattern);
        useRegexStore.getState().setCurrentPattern(pattern);
      });

      act(() => {
        useRegexStore.getState().deletePattern(pattern.id);
      });

      expect(useRegexStore.getState().currentPattern).toBeNull();
    });

    it('should not change current pattern if the deleted pattern is not the current pattern', () => {
      const pattern1 = createTestPattern({ id: 'id1' });
      const pattern2 = createTestPattern({ id: 'id2' });
      
      act(() => {
        useRegexStore.getState().addPattern(pattern1);
        useRegexStore.getState().addPattern(pattern2);
        useRegexStore.getState().setCurrentPattern(pattern2);
      });

      act(() => {
        useRegexStore.getState().deletePattern('id1');
      });

      expect(useRegexStore.getState().currentPattern).toEqual(pattern2);
    });
  });
}); 