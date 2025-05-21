import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import HomePage from '../HomePage';
import { generateRegex } from '@/utils/ollamaClient';
import { useRegexStore } from '@/stores/regexStore';

// Mock the Ollama client
jest.mock('@/utils/ollamaClient', () => ({
  generateRegex: jest.fn(),
  testRegex: jest.fn().mockImplementation(() => ({
    isValid: true,
    matches: ['test@example.com'],
  })),
}));

// Mock Zustand store
jest.mock('@/stores/regexStore', () => ({
  useRegexStore: jest.fn(),
}));

describe('HomePage', () => {
  const mockAddPattern = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock the store implementation
    (useRegexStore as jest.Mock).mockImplementation((selector) => {
      const store = {
        addPattern: mockAddPattern,
      };
      return selector(store);
    });

    // Reset the mocked generateRegex function
    (generateRegex as jest.Mock).mockResolvedValue('/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}/g');
  });

  it('renders the page title', () => {
    render(<HomePage />);
    expect(screen.getByText('AI RegEx Generator')).toBeInTheDocument();
  });

  it('allows entering a description', () => {
    render(<HomePage />);
    const textarea = screen.getByPlaceholderText(/Describe in plain language/i);
    fireEvent.change(textarea, { target: { value: 'Match email addresses' } });
    expect(textarea).toHaveValue('Match email addresses');
  });

  it('disables the generate button when no description is provided', () => {
    render(<HomePage />);
    const button = screen.getByText('Generate Pattern');
    expect(button).toBeDisabled();
  });

  it('enables the generate button when a description is provided', () => {
    render(<HomePage />);
    const textarea = screen.getByPlaceholderText(/Describe in plain language/i);
    fireEvent.change(textarea, { target: { value: 'Match email addresses' } });
    const button = screen.getByText('Generate Pattern');
    expect(button).not.toBeDisabled();
  });

  it('generates a regex pattern when the generate button is clicked', async () => {
    render(<HomePage />);
    
    // Enter a description
    const textarea = screen.getByPlaceholderText(/Describe in plain language/i);
    fireEvent.change(textarea, { target: { value: 'Match email addresses' } });
    
    // Click the generate button
    const button = screen.getByText('Generate Pattern');
    fireEvent.click(button);
    
    // Wait for the pattern to be generated
    await waitFor(() => {
      expect(generateRegex).toHaveBeenCalledWith({ description: 'Match email addresses' });
      expect(screen.getByText('Regular Expression')).toBeInTheDocument();
    });
    
    // Check that the pattern is displayed
    const patternInput = screen.getByLabelText('Regular Expression');
    expect(patternInput).toHaveValue('/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}/g');
  });

  it('shows an error when generation fails', async () => {
    // Mock a failed generation
    (generateRegex as jest.Mock).mockRejectedValue(new Error('Failed to generate pattern'));
    
    render(<HomePage />);
    
    // Enter a description
    const textarea = screen.getByPlaceholderText(/Describe in plain language/i);
    fireEvent.change(textarea, { target: { value: 'Match email addresses' } });
    
    // Click the generate button
    const button = screen.getByText('Generate Pattern');
    fireEvent.click(button);
    
    // Wait for the error message to be displayed
    await waitFor(() => {
      expect(screen.getByText(/Failed to generate pattern/i)).toBeInTheDocument();
    });
  });

  it('allows saving a pattern', async () => {
    render(<HomePage />);
    
    // Enter a description and generate a pattern
    const textarea = screen.getByPlaceholderText(/Describe in plain language/i);
    fireEvent.change(textarea, { target: { value: 'Match email addresses' } });
    
    const generateButton = screen.getByText('Generate Pattern');
    fireEvent.click(generateButton);
    
    await waitFor(() => {
      expect(screen.getByText('Save to Your Library')).toBeInTheDocument();
    });
    
    // Enter a name for the pattern
    const nameInput = screen.getByLabelText('Name');
    fireEvent.change(nameInput, { target: { value: 'Email Pattern' } });
    
    // Enter tags
    const tagsInput = screen.getByLabelText('Tags (comma separated)');
    fireEvent.change(tagsInput, { target: { value: 'email, validation' } });
    
    // Click the save button
    const saveButton = screen.getByText('Save Pattern');
    fireEvent.click(saveButton);
    
    // Check that the pattern was added to the store
    await waitFor(() => {
      expect(mockAddPattern).toHaveBeenCalledWith(expect.objectContaining({
        name: 'Email Pattern',
        description: 'Match email addresses',
        pattern: '/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}/g',
        tags: ['email', 'validation'],
      }));
    });
    
    // The form should be reset
    expect(textarea).toHaveValue('');
  });
}); 