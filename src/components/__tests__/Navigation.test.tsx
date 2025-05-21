import { render, screen } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import Navigation from '../Navigation';

// Mock react-router-dom's useLocation hook
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: jest.fn(),
  Link: ({ children, to, className }: { children: React.ReactNode; to: string; className?: string }) => (
    <a href={to} className={className} data-testid={`link-${to.replace('/', '')}`}>
      {children}
    </a>
  ),
}));

describe('Navigation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the app title', () => {
    // Mock useLocation to return a pathname of '/'
    (useLocation as jest.Mock).mockReturnValue({ pathname: '/' });

    render(
      <MemoryRouter>
        <Navigation />
      </MemoryRouter>
    );

    expect(screen.getByText('AI RegEx Generator')).toBeInTheDocument();
  });

  it('renders navigation links', () => {
    // Mock useLocation to return a pathname of '/'
    (useLocation as jest.Mock).mockReturnValue({ pathname: '/' });

    render(
      <MemoryRouter>
        <Navigation />
      </MemoryRouter>
    );

    expect(screen.getByText('Generator')).toBeInTheDocument();
    expect(screen.getByText('Library')).toBeInTheDocument();
  });

  it('applies the active class to the current route link', () => {
    // Mock useLocation to return a pathname of '/'
    (useLocation as jest.Mock).mockReturnValue({ pathname: '/' });

    render(
      <MemoryRouter>
        <Navigation />
      </MemoryRouter>
    );

    // The Generator link should have the active class
    const generatorLink = screen.getByTestId('link-');
    expect(generatorLink.className).toContain('text-blue-600');
    expect(generatorLink.className).toContain('border-b-2');
    expect(generatorLink.className).toContain('border-blue-600');

    // The Library link should not have the active class
    const libraryLink = screen.getByTestId('link-library');
    expect(libraryLink.className).not.toContain('border-blue-600');
  });

  it('applies the active class to the Library link when on the library route', () => {
    // Mock useLocation to return a pathname of '/library'
    (useLocation as jest.Mock).mockReturnValue({ pathname: '/library' });

    render(
      <MemoryRouter>
        <Navigation />
      </MemoryRouter>
    );

    // The Generator link should not have the active class
    const generatorLink = screen.getByTestId('link-');
    expect(generatorLink.className).not.toContain('border-blue-600');

    // The Library link should have the active class
    const libraryLink = screen.getByTestId('link-library');
    expect(libraryLink.className).toContain('text-blue-600');
    expect(libraryLink.className).toContain('border-b-2');
    expect(libraryLink.className).toContain('border-blue-600');
  });
}); 