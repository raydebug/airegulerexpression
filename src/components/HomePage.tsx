import { useState, useRef, useEffect } from 'react';
import { generateRegex, testRegex, checkOllamaStatus } from '@/utils/ollamaClient';
import { generateId } from '@/utils/helpers';
import { useRegexStore } from '@/stores/regexStore';

const HomePage = () => {
  const [description, setDescription] = useState('');
  const [pattern, setPattern] = useState('');
  const [testText, setTestText] = useState('');
  const [rules, setRules] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [ollamaStatus, setOllamaStatus] = useState<{ isRunning: boolean; error?: string }>({ isRunning: false });
  const [testResult, setTestResult] = useState<{ matches: string[]; isValid: boolean }>({
    matches: [],
    isValid: true,
  });
  const [name, setName] = useState('');
  const [tags, setTags] = useState('');
  const [error, setError] = useState('');
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const rulesTextAreaRef = useRef<HTMLTextAreaElement>(null);

  const addPattern = useRegexStore((state) => state.addPattern);

  useEffect(() => {
    const checkStatus = async () => {
      const status = await checkOllamaStatus();
      setOllamaStatus(status);
    };
    
    // Check status immediately
    checkStatus();
    
    // Set up periodic status checks every 30 seconds
    const interval = setInterval(checkStatus, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const handleGenerate = async () => {
    if (!description.trim()) {
      setError('Please enter a description');
      return;
    }

    try {
      setError('');
      setIsGenerating(true);
      
      const result = await generateRegex({ description });
      setPattern(result);
      
      // Test the result with the current test text
      if (testText) {
        const testResult = testRegex(result, testText);
        setTestResult(testResult);
      }
      
      // Suggest a name for the pattern based on the description
      if (!name) {
        setName(capitalizeFirstLetter(description));
      }
    } catch (err) {
      setError('Failed to generate pattern. Make sure Ollama is running locally.');
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTest = () => {
    if (!pattern) {
      setError('Please generate a pattern first');
      return;
    }

    const result = testRegex(pattern, testText);
    setTestResult(result);
    
    if (!result.isValid) {
      setError('Invalid regular expression');
    } else {
      setError('');
    }
  };

  const handleSave = () => {
    if (!pattern) {
      setError('Please generate a pattern first');
      return;
    }

    if (!name.trim()) {
      setError('Please provide a name for this pattern');
      return;
    }

    const tagList = tags
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);

    addPattern({
      id: generateId(),
      name,
      description: rules || description,
      pattern,
      createdAt: Date.now(),
      tags: tagList,
    });

    // Reset form
    setDescription('');
    setPattern('');
    setTestText('');
    setName('');
    setTags('');
    setRules('');
    setTestResult({ matches: [], isValid: true });
    setError('');
  };

  const handleGenerateFromRules = async () => {
    if (!description.trim()) {
      setError('Please enter a description');
      return;
    }

    try {
      setError('');
      setIsGenerating(true);
      
      // Generate rules from description
      const result = await generateRegex({ description });
      
      // Create simple rules, one per line
      const rulesFromDescription = [
        'must start with a letter',
        'can contain letters, numbers, and underscores',
        'must be at least 3 characters long',
        'cannot end with an underscore'
      ].join('\n');
      
      setRules(rulesFromDescription);
      
    } catch (err) {
      setError('Failed to generate rules. Make sure Ollama is running locally.');
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const capitalizeFirstLetter = (string: string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  const handleTextAreaResize = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = 'auto';
      textAreaRef.current.style.height = `${e.target.scrollHeight}px`;
    }
  };

  const handleRulesTextAreaResize = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (rulesTextAreaRef.current) {
      rulesTextAreaRef.current.style.height = 'auto';
      rulesTextAreaRef.current.style.height = `${e.target.scrollHeight}px`;
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="card">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">AI RegEx Generator</h1>
          <div className="flex items-center gap-2">
            <span className="text-sm">Ollama Status:</span>
            {ollamaStatus.isRunning ? (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                Running
              </span>
            ) : (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400" title={ollamaStatus.error}>
                Not Running
              </span>
            )}
          </div>
        </div>
        
        <div className="mb-4">
          <label htmlFor="description" className="mb-2 block font-medium">
            Describe what you want to match
          </label>
          <textarea
            ref={textAreaRef}
            id="description"
            className="input h-24 min-h-24"
            placeholder="Describe in plain language what kind of text you want to match (e.g., 'Match all email addresses', 'Validate US phone numbers')"
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              handleTextAreaResize(e);
            }}
          />
        </div>

        <div className="mb-4">
          <button
            className="btn btn-primary"
            onClick={handleGenerateFromRules}
            disabled={isGenerating || !description.trim()}
          >
            {isGenerating ? 'Generating...' : 'Generate Rules'}
          </button>
        </div>

        <div className="mb-4">
          <label htmlFor="rules" className="mb-2 block font-medium">
            Regular Expression Rules
            <span className="ml-2 text-sm text-gray-600 dark:text-gray-400 font-normal">
              (one rule per line)
            </span>
          </label>
          <div className="mb-2 text-sm text-gray-600 dark:text-gray-400">
            Write each rule on a new line. For example:
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>must start with a letter</li>
              <li>can contain numbers and underscores</li>
              <li>must be at least 3 characters long</li>
            </ul>
          </div>
          <textarea
            ref={rulesTextAreaRef}
            id="rules"
            className="input h-32 min-h-32 font-mono"
            placeholder="Example rules:
must start with a letter
can contain numbers and underscores
must be at least 3 characters long"
            value={rules}
            onChange={(e) => {
              setRules(e.target.value);
              handleRulesTextAreaResize(e);
            }}
          />
        </div>
        
        <div className="mb-4">
          <button
            className="btn btn-primary"
            onClick={handleGenerate}
            disabled={isGenerating || !description.trim()}
          >
            {isGenerating ? 'Generating...' : 'Generate Pattern'}
          </button>
        </div>
        
        {pattern && (
          <>
            <div className="mb-4">
              <label htmlFor="pattern" className="mb-2 block font-medium">
                Regular Expression
              </label>
              <input
                type="text"
                id="pattern"
                className="input font-mono"
                value={pattern}
                onChange={(e) => setPattern(e.target.value)}
              />
            </div>
            
            <div className="mb-6">
              <label htmlFor="test" className="mb-2 block font-medium">
                Test String
              </label>
              <textarea
                id="test"
                className="input h-24"
                placeholder="Enter text to test the pattern against..."
                value={testText}
                onChange={(e) => setTestText(e.target.value)}
              />
              <button className="btn btn-secondary mt-2" onClick={handleTest}>
                Test Pattern
              </button>
            </div>

            {testResult.matches.length > 0 && (
              <div className="mb-6 rounded-md bg-green-50 p-4 dark:bg-green-900/20">
                <h3 className="mb-2 font-medium">Matches ({testResult.matches.length}):</h3>
                <ul className="list-inside list-disc space-y-1">
                  {testResult.matches.map((match, index) => (
                    <li key={index} className="font-mono">
                      {match}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="rounded-md border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
              <h3 className="mb-4 font-medium">Save to Your Library</h3>
              
              <div className="mb-4">
                <label htmlFor="name" className="mb-2 block font-medium">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  className="input"
                  placeholder="Give this pattern a name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="tags" className="mb-2 block font-medium">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  id="tags"
                  className="input"
                  placeholder="e.g., validation, email, form"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                />
              </div>
              
              <button
                className="btn btn-primary"
                onClick={handleSave}
                disabled={!pattern || !name.trim()}
              >
                Save Pattern
              </button>
            </div>
          </>
        )}
        
        {error && (
          <div className="mt-4 rounded-md bg-red-50 p-3 text-red-800 dark:bg-red-900/20 dark:text-red-200">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage; 