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
            role: "user",
            content: prompt
          }
        ],
        stream: false,
        options: {
          temperature: 0.1,
          top_p: 0.9
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
const DEFAULT_MODEL = 'deepseek-coder';

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
    const prompt = `Generate a regular expression pattern for: ${description}

Your response must contain ONLY the regex pattern in this exact format:
/pattern/${flags}

For example, if I ask for "email addresses", you should respond with exactly:
/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}/g

Rules:
1. Start with /
2. End with /${flags}
3. No explanation or other text
4. No code blocks or quotes
5. Just the pattern itself`;

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
      // Remove any text before the first slash if it starts with a word boundary
      .replace(/^\b[^/]+\//, '/')
      // Remove any text after the pattern
      .replace(new RegExp(`/${flags}[^]*$`), `/${flags}`)
      // Remove any newlines or extra spaces
      .replace(/\s+/g, '');

    // Log the cleaned pattern for debugging
    if (process.env.NODE_ENV !== 'production') {
      console.log('Cleaned pattern:', regexPattern);
    }

    // If the pattern doesn't start with a slash but looks like a valid regex
    if (!regexPattern.startsWith('/')) {
      if (/^[\[\w\\(]/.test(regexPattern)) {
        regexPattern = `/${regexPattern}/${flags}`;
      } else {
        console.error('Pattern does not start with / and is not a valid regex:', regexPattern);
        throw new Error('Invalid regex pattern format');
      }
    }

    // Validate the pattern format
    const patternMatch = regexPattern.match(/^\/(.+)\/([a-z]*)$/);
    if (!patternMatch) {
      console.error('Pattern does not match expected format:', regexPattern);
      throw new Error('Invalid regex pattern format');
    }

    // Test if it's a valid regex by trying to create a RegExp object
    try {
      const [, pattern, patternFlags] = patternMatch;
      new RegExp(pattern, patternFlags);
    } catch (e) {
      console.error('Invalid RegExp:', regexPattern, e);
      throw new Error('Invalid regex pattern');
    }

    return regexPattern;
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