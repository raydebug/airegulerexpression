import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import RegexLibrary from '../RegexLibrary';
import { useRegexStore, RegexPattern } from '@/stores/regexStore';
import { formatDate } from '@/utils/helpers';

// Mock the Zustand store
jest.mock('@/stores/regexStore', () => ({
  useRegexStore: jest.fn(),
}));

// Mock the helpers
jest.mock('@/utils/helpers', () => ({
  formatDate: jest.fn().mockImplementation((timestamp) => `${new Date(timestamp).toDateString()}`),
  isValidRegex: jest.fn().mockReturnValue(true),
}));

describe('RegexLibrary', () => {
  const mockPatterns: RegexPattern[] = [
    {
      id: 'pattern1',
      name: 'Email Pattern',
      description: 'Matches email addresses',
      pattern: '/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}/g',
      createdAt: 1622548800000, // 2021-06-01
      tags: ['email', 'validation'],
    },
    {
      id: 'pattern2',
      name: 'Phone Number',
      description: 'Matches phone numbers',
      pattern: '/[0-9]{3}-[0-9]{3}-[0-9]{4}/g',
      createdAt: 1625140800000, // 2021-07-01
      tags: ['phone', 'validation'],
    },
  ];

  const mockUpdatePattern = jest.fn();
  const mockDeletePattern = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock the store implementation
    (useRegexStore as jest.Mock).mockImplementation(() => ({
      patterns: mockPatterns,
      updatePattern: mockUpdatePattern,
      deletePattern: mockDeletePattern,
    }));
  });

  it('renders the library title', () => {
    render(<RegexLibrary />);
    expect(screen.getByText('Your RegEx Library')).toBeInTheDocument();
  });

  it('displays saved patterns', () => {
    render(<RegexLibrary />);
    
    // Check if both patterns are displayed
    expect(screen.getByText('Email Pattern')).toBeInTheDocument();
    expect(screen.getByText('Phone Number')).toBeInTheDocument();
    
    // Check if the patterns' descriptions are displayed
    expect(screen.getByText('Matches email addresses')).toBeInTheDocument();
    expect(screen.getByText('Matches phone numbers')).toBeInTheDocument();
    
    // Check if the patterns' regex patterns are displayed
    expect(screen.getByText('/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}/g')).toBeInTheDocument();
    expect(screen.getByText('/[0-9]{3}-[0-9]{3}-[0-9]{4}/g')).toBeInTheDocument();
  });

  it('allows filtering patterns by search term', () => {
    render(<RegexLibrary />);
    
    // Enter a search term that should match only the email pattern
    const searchInput = screen.getByPlaceholderText('Search patterns...');
    fireEvent.change(searchInput, { target: { value: 'email' } });
    
    // The email pattern should still be visible
    expect(screen.getByText('Email Pattern')).toBeInTheDocument();
    
    // The phone pattern should no longer be visible
    expect(screen.queryByText('Phone Number')).not.toBeInTheDocument();
  });

  it('shows a message when no patterns match the search', () => {
    render(<RegexLibrary />);
    
    // Enter a search term that won't match any patterns
    const searchInput = screen.getByPlaceholderText('Search patterns...');
    fireEvent.change(searchInput, { target: { value: 'nonexistent' } });
    
    // Check for the "no matches" message
    expect(screen.getByText('No patterns match your search')).toBeInTheDocument();
  });

  it('shows a message when the library is empty', () => {
    // Mock an empty patterns array
    (useRegexStore as jest.Mock).mockImplementation(() => ({
      patterns: [],
      updatePattern: mockUpdatePattern,
      deletePattern: mockDeletePattern,
    }));
    
    render(<RegexLibrary />);
    
    // Check for the "empty library" message
    expect(screen.getByText('Your library is empty. Generate and save some patterns to see them here!')).toBeInTheDocument();
  });

  it('allows editing a pattern', async () => {
    render(<RegexLibrary />);
    
    // Find all edit buttons
    const editButtons = screen.getAllByText('Edit');
    
    // Click the edit button for the Email Pattern (second pattern in the DOM)
    fireEvent.click(editButtons[1]);
    
    // Wait for the edit form to be displayed
    await waitFor(() => {
      // Find the input with the pattern name
      const inputs = screen.getAllByRole('textbox');
      const nameInput = inputs.find(input => input.getAttribute('value') === 'Email Pattern');
      expect(nameInput).toBeInTheDocument();
      
      // Change the name
      if (nameInput) {
        fireEvent.change(nameInput, { target: { value: 'Updated Email Pattern' } });
      }
      
      // Find the textarea with the description
      const textareas = screen.getAllByRole('textbox');
      const descriptionTextarea = textareas.find(
        textarea => textarea.textContent === 'Matches email addresses'
      );
      
      // Change the description
      if (descriptionTextarea) {
        fireEvent.change(descriptionTextarea, { target: { value: 'Updated description' } });
      }
    });
    
    // Save the changes
    const saveButton = screen.getByText('Save Changes');
    fireEvent.click(saveButton);
    
    // Check if updatePattern was called with the correct arguments
    expect(mockUpdatePattern).toHaveBeenCalledWith('pattern1', expect.objectContaining({
      name: 'Updated Email Pattern',
    }));
  });

  it('allows deleting a pattern', () => {
    // Mock window.confirm to return true
    window.confirm = jest.fn().mockReturnValue(true);
    
    render(<RegexLibrary />);
    
    // Find all delete buttons
    const deleteButtons = screen.getAllByText('Delete');
    
    // Click the delete button for the Email Pattern (second pattern in the DOM)
    fireEvent.click(deleteButtons[1]);
    
    // Check if deletePattern was called with the correct id
    expect(mockDeletePattern).toHaveBeenCalledWith('pattern1');
  });

  it('does not delete a pattern if user cancels confirmation', () => {
    // Mock window.confirm to return false
    window.confirm = jest.fn().mockReturnValue(false);
    
    render(<RegexLibrary />);
    
    // Find and click the delete button for the first pattern
    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[0]);
    
    // deletePattern should not have been called
    expect(mockDeletePattern).not.toHaveBeenCalled();
  });
}); 