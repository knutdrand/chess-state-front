import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Info } from './Info';

describe('Info Component', () => {
  const defaultProps = {
    mode: 'show',
    feedback: 'Nf3',
    width: '400px',
    link: 'https://example.com/chess-lesson',
    onExplanation: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders with show mode and displays feedback', () => {
    render(<Info {...defaultProps} />);
    
    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
    
    // Check for explanation button
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  test('renders with non-show mode and displays repeat message', () => {
    const props = { ...defaultProps, mode: 'repeat' };
    render(<Info {...props} />);

    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveClass('MuiAlert-colorWarning');
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

  test('applies correct width styling', () => {
    const customWidth = '600px';
    const props = { ...defaultProps, width: customWidth };
    
    render(<Info {...props} />);
    
    const container = screen.getByRole('alert').parentElement;
    expect(container).toHaveStyle(`width: ${customWidth}`);
  });

  test('shows error severity for show mode', () => {
    const props = { ...defaultProps, mode: 'show' };
    render(<Info {...props} />);

    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('MuiAlert-colorError');
  });

  test('shows warning severity for non-show mode', () => {
    const props = { ...defaultProps, mode: 'practice' };
    render(<Info {...props} />);

    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('MuiAlert-colorWarning');
  });

  test('button contains expand icon', () => {
    render(<Info {...defaultProps} />);
    
    const button = screen.getByRole('button');
    const icon = button.querySelector('svg');
    expect(icon).toBeInTheDocument();
  });

  test('handles empty feedback string', () => {
    const props = { ...defaultProps, feedback: '' };
    render(<Info {...props} />);
    
    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
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
    
    // Check for Alert component
    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('MuiAlert-root');
    
    // Check for Button component
    const button = screen.getByRole('button');
    expect(button).toHaveClass('MuiButton-root');
    
    // Check for Typography component
    const typography = screen.getByText('View in Chessable').closest('.MuiTypography-root');
    expect(typography).toBeInTheDocument();
  });
});
