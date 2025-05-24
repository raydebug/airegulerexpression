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
Do not write any explanations or text.
Do not include code blocks.

Format: /PATTERN/${flags}

Examples:
For "email": /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}/${flags}
For "phone": /\\d{3}[-.]?\\d{3}[-.]?\\d{4}/${flags}
For "postcode": /^[0-9]{4}$/${flags}

Return ONLY the pattern, nothing else.`;

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
      // Split into lines and get the first line that looks like a pattern
      .split('\n')
      .map(line => line.trim())
      .find(line => /^\/.*\/[a-z]*$/.test(line)) || '';

    // If we didn't find a pattern with delimiters, try to extract one
    if (!regexPattern || !regexPattern.startsWith('/')) {
      const possiblePattern = regexPattern
        .split('\n')
        .map(line => line.trim())
        .find(line => /[\[\]\{\}\(\)\^\$\w\\\*\+\?]/.test(line));
      
      if (possiblePattern) {
        regexPattern = `/${possiblePattern}/${flags}`;
      }
    }

    // Log the cleaned pattern for debugging
    if (process.env.NODE_ENV !== 'production') {
      console.log('Cleaned pattern:', regexPattern);
    }

    // Handle specific pattern types
    if (description.toLowerCase().includes('email')) {
      // Ensure we have a proper email pattern
      const emailPattern = '/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}/' + flags;
      if (!regexPattern || !isValidRegExp(regexPattern)) {
        regexPattern = emailPattern;
      }
    }

    // Validate and potentially fix the pattern
    try {
      regexPattern = validateAndFixPattern(regexPattern, description, flags);
      return regexPattern;
    } catch (e) {
      console.error('Invalid RegExp:', regexPattern, e);
      throw new Error('Invalid regex pattern');
    }
  } catch (error) {
    if (process.env.NODE_ENV !== 'test') {
      console.error('Error generating regex:', error);
    }
    throw error instanceof Error ? error : new Error('Failed to generate regex pattern');
  }
}

function isValidRegExp(pattern: string): boolean {
  try {
    const match = pattern.match(/^\/(.+)\/([a-z]*)$/);
    if (!match) return false;
    new RegExp(match[1], match[2]);
    return true;
  } catch {
    return false;
  }
}

function validateAndFixPattern(pattern: string, description: string, flags: string): string {
  // Extract the actual pattern without delimiters
  const match = pattern.match(/^\/(.+)\/([a-z]*)$/);
  if (!match) {
    throw new Error('Invalid pattern format');
  }

  let [, actualPattern, patternFlags] = match;

  // Fix common issues with escaped characters
  actualPattern = actualPattern
    // Fix double-escaped backslashes
    .replace(/\\\\([dws])/gi, '\\$1')
    // Fix missing escapes for dots
    .replace(/(?<!\\)\./g, '\\.')
    // Remove any explanatory text that might have gotten through
    .replace(/explanation:|pattern:|example:/gi, '')
    .trim();

  // Test the pattern
  try {
    const regex = new RegExp(actualPattern, patternFlags);
    
    // For email addresses, test with valid and invalid cases
    if (description.toLowerCase().includes('email')) {
      const validEmail = 'test@example.com';
      const invalidEmail = 'invalid.email';
      if (!regex.test(validEmail) || regex.test(invalidEmail)) {
        return '/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}/' + flags;
      }
    }

    return `/${actualPattern}/${flags}`;
  } catch (e) {
    console.error('Error validating pattern:', e);
    throw new Error('Invalid regex pattern');
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