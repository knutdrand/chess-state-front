import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Info } from './Info';

describe('Info Component', () => {
  const defaultProps = {
    mode: 'show',
    feedback: 'Nf3',
    width: '400px',
    link: 'https://example.com/chess-lesson',
    onExplanation: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders the explanation button', () => {
    render(<Info {...defaultProps} />);

    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  test('renders in repeat mode', () => {
    const props = { ...defaultProps, mode: 'repeat' };
    render(<Info {...props} />);

    expect(screen.getByRole('link', { name: 'View in Chessable' })).toBeInTheDocument();
  });

  test('renders external link when link starts with http', () => {
    render(<Info {...defaultProps} />);
    
    const link = screen.getByRole('link', { name: 'View in Chessable' });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', defaultProps.link);
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  test('renders external link when link starts with https', () => {
    const props = { ...defaultProps, link: 'https://secure.example.com' };
    render(<Info {...props} />);
    
    const link = screen.getByRole('link', { name: 'View in Chessable' });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', props.link);
  });

  test('renders plain text when link does not start with http/https', () => {
    const props = { ...defaultProps, link: 'Some chess instruction text' };
    render(<Info {...props} />);
    
    expect(screen.getByText('Some chess instruction text')).toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  test('renders plain text when link is null', () => {
    const props = { ...defaultProps, link: null };
    render(<Info {...props} />);
    
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  test('calls onExplanation when explanation button is clicked', () => {
    render(<Info {...defaultProps} />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(defaultProps.onExplanation).toHaveBeenCalledTimes(1);
  });

  test('button contains expand icon', () => {
    render(<Info {...defaultProps} />);

    expect(screen.getByTestId('OpenInFullIcon')).toBeInTheDocument();
  });

  test('handles empty feedback string', () => {
    const props = { ...defaultProps, feedback: '' };
    render(<Info {...props} />);

    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  test('handles very long link text', () => {
    const longLink = 'This is a very long chess instruction that should be truncated properly when displayed in the component to ensure good user experience';
    const props = { ...defaultProps, link: longLink };
    
    render(<Info {...props} />);
    
    expect(screen.getByText(longLink)).toBeInTheDocument();
  });

  test('handles special characters in link', () => {
    const specialLink = 'Chess move: Nf3+ (check!)';
    const props = { ...defaultProps, link: specialLink };
    
    render(<Info {...props} />);
    
    expect(screen.getByText(specialLink)).toBeInTheDocument();
  });

  test('component structure is correct', () => {
    render(<Info {...defaultProps} />);

    expect(screen.getByRole('button')).toHaveClass('MuiButton-root');
    expect(screen.getByRole('link', { name: 'View in Chessable' })).toHaveClass('MuiTypography-root');
  });
});
