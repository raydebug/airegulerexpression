// Create a function to make API requests to Ollama
async function callOllamaApi(model: string, prompt: string): Promise<string> {
  try {
    // In development and production, use the API proxy
    const response = await fetch('/api/ollama/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    return data.message.content.trim();
  } catch (error) {
    if (process.env.NODE_ENV !== 'test') {
      console.error('Error calling Ollama API:', error);
    }
    throw new Error('Failed to generate regex pattern');
  }
}

// Default model to use, can be customized later
const DEFAULT_MODEL = 'llama3';

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
    const prompt = `
Generate a regular expression that matches the following pattern:
${description}

Return ONLY the regex pattern without explanation, comments or code formatting.
If appropriate, include the flags: ${flags}

For example, for "match all email addresses", you would return:
/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}/g
`;

    // Get response from Ollama API
    const regexPattern = await callOllamaApi(model, prompt);

    // Clean up the response to extract just the regex
    // Remove code blocks and trailing explanation if any
    let cleanedPattern = regexPattern
      .replace(/```\w*/g, '')
      .replace(/```/g, '')
      .trim();

    // If it's wrapped in forward slashes with flags, return as is
    if (/^\/.*\/[a-z]*$/.test(cleanedPattern)) {
      return cleanedPattern;
    }

    // If it's just the pattern without delimiters, add them with the flags
    return `/${cleanedPattern}/${flags}`;
  } catch (error) {
    // Only log the error in development, not in testing
    if (process.env.NODE_ENV !== 'test') {
      console.error('Error generating regex:', error);
    }
    throw new Error('Failed to generate regex pattern');
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