import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface RegexPattern {
  id: string;
  name: string;
  description: string;
  pattern: string;
  createdAt: number;
  tags: string[];
}

interface RegexState {
  patterns: RegexPattern[];
  currentPattern: RegexPattern | null;
  setCurrentPattern: (pattern: RegexPattern | null) => void;
  addPattern: (pattern: RegexPattern) => void;
  updatePattern: (id: string, updates: Partial<RegexPattern>) => void;
  deletePattern: (id: string) => void;
}

export const useRegexStore = create<RegexState>()(
  persist(
    (set) => ({
      patterns: [],
      currentPattern: null,
      
      setCurrentPattern: (pattern) => set({ currentPattern: pattern }),
      
      addPattern: (pattern) => 
        set((state) => ({ 
          patterns: [...state.patterns, pattern] 
        })),
      
      updatePattern: (id, updates) => 
        set((state) => ({ 
          patterns: state.patterns.map(pattern => 
            pattern.id === id ? { ...pattern, ...updates } : pattern
          ),
          currentPattern: state.currentPattern?.id === id 
            ? { ...state.currentPattern, ...updates } 
            : state.currentPattern
        })),
      
      deletePattern: (id) => 
        set((state) => ({ 
          patterns: state.patterns.filter(pattern => pattern.id !== id),
          currentPattern: state.currentPattern?.id === id ? null : state.currentPattern
        })),
    }),
    {
      name: 'regex-patterns',
    }
  )
); 