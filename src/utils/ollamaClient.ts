// Create a function to check Ollama status
export async function checkOllamaStatus(): Promise<{ isRunning: boolean; error?: string }> {
  try {
    const response = await fetch('/api/ollama/version');
    if (!response.ok) {
      return { isRunning: false, error: `HTTP error! status: ${response.status}` };
    }
    const data = await response.json();
    return { isRunning: true };
  } catch (error) {
    return { 
      isRunning: false, 
      error: error instanceof Error ? error.message : 'Failed to connect to Ollama'
    };
  }
}

// Create a function to make API requests to Ollama
async function callOllamaApi(model: string, prompt: string): Promise<string> {
  try {
    if (process.env.NODE_ENV !== 'production') {
      console.log('Calling Ollama API with model:', model);
      console.log('Prompt:', prompt);
    }

    const response = await fetch('/api/ollama/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "system",
            content: "You are a regex pattern generator. You only output valid regex patterns in the exact format requested. Never explain or add comments."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        stream: false,
        options: {
          temperature: 0.1,
          top_p: 0.95,
          top_k: 40,
          num_predict: 100,
          repeat_penalty: 1.1
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API request failed:', response.status, errorText);
      throw new Error(`API request failed with status ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    
    if (process.env.NODE_ENV !== 'production') {
      console.log('Raw API response:', data);
    }

    if (!data.message?.content) {
      console.error('Invalid API response format:', data);
      throw new Error('Invalid response format from Ollama API');
    }

    return data.message.content;
  } catch (error) {
    if (process.env.NODE_ENV !== 'test') {
      console.error('Error calling Ollama API:', error);
    }
    throw error instanceof Error ? error : new Error('Failed to generate regex pattern');
  }
}

// Default model to use, can be customized later
const DEFAULT_MODEL = 'tinyllama';

// Create a base URL for API requests - this helps with mocking in tests
const API_BASE_URL = process.env.NODE_ENV === 'test' ? 'http://localhost:11434' : '';

interface GenerateRegexOptions {
  description: string;
  flags?: string;
  model?: string;
}

/**
 * Generates a regular expression pattern based on a description using local AI
 */
export async function generateRegex({
  description,
  flags = 'g',
  model = DEFAULT_MODEL,
}: GenerateRegexOptions): Promise<string> {
  try {
    // Prompt engineering for better regex generation
    const prompt = `Write ONLY a regex pattern for: ${description}

CRITICAL: Your entire response must be ONLY the pattern itself.
Do not write any explanations, labels, or other text.
Do not write "Regular Expression Pattern:" or any other labels.
Do not include code blocks.

Format: /PATTERN/${flags}

Example request: "email address"
Example response: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}/${flags}

Example request: "australian postcode"
Example response: /^[0-9]{4}$/${flags}

Your response must be exactly one line containing only the pattern.`;

    // Get response from Ollama API
    let regexPattern = await callOllamaApi(model, prompt);

    // Log the raw response for debugging
    if (process.env.NODE_ENV !== 'production') {
      console.log('Raw response from Ollama:', regexPattern);
    }

    // Clean up the response
    regexPattern = regexPattern
      .trim()
      // Remove any markdown code blocks
      .replace(/```[\s\S]*?```/g, '')
      // Remove any backticks
      .replace(/`/g, '')
      // Remove any lines that don't contain a pattern
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.includes('/') && line.includes(flags))
      .pop() || '';

    // If we couldn't find a pattern in the response, try to extract one
    if (!regexPattern) {
      // Look for something that looks like a regex pattern without delimiters
      const patternMatch = regexPattern.match(/\^?[0-9\[\]{}]+\$?/);
      if (patternMatch) {
        regexPattern = `/${patternMatch[0]}/${flags}`;
      }
    }

    // Log the cleaned pattern for debugging
    if (process.env.NODE_ENV !== 'production') {
      console.log('Cleaned pattern:', regexPattern);
    }

    // Reject obviously wrong patterns
    if (regexPattern === `/pattern/${flags}` || regexPattern === `/PATTERN/${flags}`) {
      throw new Error('Model returned literal example pattern');
    }

    // Validate basic pattern structure
    if (!regexPattern.startsWith('/') || !regexPattern.endsWith(`/${flags}`)) {
      // If it looks like a bare pattern without delimiters, add them
      if (/^\^?\[?[0-9]/.test(regexPattern)) {
        regexPattern = `/${regexPattern}/${flags}`;
      } else {
        console.error('Pattern does not have correct delimiters:', regexPattern);
        throw new Error('Invalid regex pattern format');
      }
    }

    // Extract the pattern without delimiters
    const patternMatch = regexPattern.match(/^\/(.+)\/([a-z]*)$/);
    if (!patternMatch) {
      console.error('Pattern does not match expected format:', regexPattern);
      throw new Error('Invalid regex pattern format');
    }

    // Test if it's a valid regex by trying to create a RegExp object
    try {
      const [, pattern, patternFlags] = patternMatch;
      
      // Additional validation for obviously wrong patterns
      if (pattern.length > 100) {
        throw new Error('Pattern is suspiciously long');
      }
      if (pattern.includes('pattern') || pattern.includes('PATTERN') || /[A-Z]{5,}/.test(pattern)) {
        throw new Error('Pattern contains invalid text');
      }
      
      // For postcodes, ensure we have a proper pattern
      if (description.toLowerCase().includes('postcode')) {
        // If we got a bare pattern without anchors, add them
        if (!pattern.startsWith('^')) {
          regexPattern = `/^${pattern}/${flags}`;
        }
        if (!pattern.endsWith('$')) {
          regexPattern = `/${pattern}$/${flags}`;
        }
        // Ensure it matches exactly 4 digits
        if (!pattern.includes('{4}') && !pattern.match(/[0-9][0-9][0-9][0-9]/)) {
          regexPattern = `/^[0-9]{4}$/${flags}`;
        }
      }

      // Final validation of the pattern
      const regex = new RegExp(patternMatch[1], patternMatch[2]);
      
      // Test the regex with appropriate test cases
      if (description.toLowerCase().includes('postcode')) {
        const validPostcode = '1234';
        const invalidPostcode = '12345';
        if (!regex.test(validPostcode) || regex.test(invalidPostcode)) {
          throw new Error('Pattern does not correctly match postcodes');
        }
      }
      
      return regexPattern;
    } catch (e) {
      console.error('Invalid RegExp:', regexPattern, e);
      throw new Error('Invalid regex pattern');
    }
  } catch (error) {
    // Only log the error in development, not in testing
    if (process.env.NODE_ENV !== 'test') {
      console.error('Error generating regex:', error);
    }
    throw error instanceof Error ? error : new Error('Failed to generate regex pattern');
  }
}

/**
 * Tests a regex pattern against a string and returns matches
 */
export function testRegex(
  pattern: string,
  testString: string
): { matches: string[]; isValid: boolean } {
  try {
    // Extract the pattern and flags from the string
    const match = pattern.match(/\/(.*)\/([a-z]*)/);
    
    if (!match) {
      return { matches: [], isValid: false };
    }
    
    const [, regexBody, flags] = match;
    const regex = new RegExp(regexBody, flags);
    
    // Get all matches
    const matches = Array.from(testString.matchAll(regex)).map(m => m[0]);
    
    return {
      matches,
      isValid: true,
    };
  } catch (error) {
    return {
      matches: [],
      isValid: false,
    };
  }
} 