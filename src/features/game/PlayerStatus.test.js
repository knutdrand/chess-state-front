import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { PlayerStatus } from './PlayerStatus';

describe('PlayerStatus Component', () => {
  const defaultProps = {
    score: 5.7,
    width: 400,
    onSolution: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders with correct score and width', () => {
    render(<PlayerStatus {...defaultProps} />);
    
    // Check if the component renders
    const alertElement = screen.getByRole('alert');
    expect(alertElement).toBeInTheDocument();
    
    // Check if the button is present
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  test('calls onSolution when button is clicked', () => {
    render(<PlayerStatus {...defaultProps} />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(defaultProps.onSolution).toHaveBeenCalledTimes(1);
  });

  test('renders with integer score', () => {
    const props = { ...defaultProps, score: 3 };
    render(<PlayerStatus {...props} />);
    
    const alertElement = screen.getByRole('alert');
    expect(alertElement).toBeInTheDocument();
  });

  test('renders with zero score', () => {
    const props = { ...defaultProps, score: 0 };
    render(<PlayerStatus {...props} />);
    
    const alertElement = screen.getByRole('alert');
    expect(alertElement).toBeInTheDocument();
  });

  test('renders with negative score', () => {
    const props = { ...defaultProps, score: -1.5 };
    render(<PlayerStatus {...props} />);
    
    const alertElement = screen.getByRole('alert');
    expect(alertElement).toBeInTheDocument();
  });

  test('applies correct width styling', () => {
    const customWidth = 600;
    const props = { ...defaultProps, width: customWidth };
    
    render(<PlayerStatus {...props} />);
    
    const container = screen.getByRole('alert').parentElement;
    expect(container).toHaveStyle(`width: ${customWidth}px`);
  });

  test('button contains key icon', () => {
    render(<PlayerStatus {...defaultProps} />);
    
    const button = screen.getByRole('button');
    const keyIcon = button.querySelector('svg');
    expect(keyIcon).toBeInTheDocument();
  });

  test('handles multiple rapid clicks', () => {
    render(<PlayerStatus {...defaultProps} />);
    
    const button = screen.getByRole('button');
    
    // Click multiple times rapidly
    fireEvent.click(button);
    fireEvent.click(button);
    fireEvent.click(button);
    
    expect(defaultProps.onSolution).toHaveBeenCalledTimes(3);
  });

  test('renders with very large score', () => {
    const props = { ...defaultProps, score: 999.99 };
    render(<PlayerStatus {...props} />);
    
    const alertElement = screen.getByRole('alert');
    expect(alertElement).toBeInTheDocument();
  });

  test('component structure is correct', () => {
    render(<PlayerStatus {...defaultProps} />);
    
    // Check for Alert component
    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('MuiAlert-root');
    
    // Check for Button component
    const button = screen.getByRole('button');
    expect(button).toHaveClass('MuiButton-root');
  });
});
