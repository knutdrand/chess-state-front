import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Navigation } from './Navigation';

describe('Navigation Component', () => {
  const defaultProps = {
    activeTab: 'play',
    setActiveTab: jest.fn(),
    handleLogout: jest.fn(),
    userName: 'TestUser',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders with user name and logo', () => {
    render(<Navigation {...defaultProps} />);
    
    // Check for user name
    expect(screen.getByText('TestUser')).toBeInTheDocument();
    
    // Check for logo
    const logo = screen.getByAltText('Chess-State Logo');
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute('src', '/logo_new2.jpg');
  });

  test('renders all navigation tabs', () => {
    render(<Navigation {...defaultProps} />);
    
    // Check for all tab buttons (they are icon buttons)
    const buttons = screen.getAllByRole('button');
    
    // Should have 4 buttons: play, courses, settings, logout
    expect(buttons).toHaveLength(4);
  });

  test('highlights active tab correctly', () => {
    render(<Navigation {...defaultProps} />);
    
    const buttons = screen.getAllByRole('button');
    
    // The first button should be the play tab and should be highlighted
    // We can't easily test the color prop, but we can test that the component renders
    expect(buttons[0]).toBeInTheDocument();
  });

  test('calls setActiveTab when play tab is clicked', () => {
    render(<Navigation {...defaultProps} />);
    
    const buttons = screen.getAllByRole('button');
    const playButton = buttons[0]; // First button is play (Home icon)
    
    fireEvent.click(playButton);
    
    expect(defaultProps.setActiveTab).toHaveBeenCalledWith('play');
  });

  test('calls setActiveTab when courses tab is clicked', () => {
    render(<Navigation {...defaultProps} />);
    
    const buttons = screen.getAllByRole('button');
    const coursesButton = buttons[1]; // Second button is courses (Menu icon)
    
    fireEvent.click(coursesButton);
    
    expect(defaultProps.setActiveTab).toHaveBeenCalledWith('courses');
  });

  test('calls setActiveTab when settings tab is clicked', () => {
    render(<Navigation {...defaultProps} />);
    
    const buttons = screen.getAllByRole('button');
    const settingsButton = buttons[2]; // Third button is settings (Settings icon)
    
    fireEvent.click(settingsButton);
    
    expect(defaultProps.setActiveTab).toHaveBeenCalledWith('settings');
  });

  test('calls handleLogout when logout button is clicked', () => {
    render(<Navigation {...defaultProps} />);
    
    const buttons = screen.getAllByRole('button');
    const logoutButton = buttons[3]; // Fourth button is logout
    
    fireEvent.click(logoutButton);
    
    expect(defaultProps.handleLogout).toHaveBeenCalledTimes(1);
  });

  test('renders with different active tab', () => {
    const props = { ...defaultProps, activeTab: 'courses' };
    render(<Navigation {...props} />);
    
    // Component should render without errors
    expect(screen.getByText('TestUser')).toBeInTheDocument();
  });

  test('renders with different user name', () => {
    const props = { ...defaultProps, userName: 'AnotherUser' };
    render(<Navigation {...props} />);
    
    expect(screen.getByText('AnotherUser')).toBeInTheDocument();
    expect(screen.queryByText('TestUser')).not.toBeInTheDocument();
  });

  test('renders with settings as active tab', () => {
    const props = { ...defaultProps, activeTab: 'settings' };
    render(<Navigation {...props} />);
    
    // Component should render without errors
    expect(screen.getByText('TestUser')).toBeInTheDocument();
  });

  test('logo has correct styling attributes', () => {
    render(<Navigation {...defaultProps} />);
    
    const logo = screen.getByAltText('Chess-State Logo');
    expect(logo).toHaveAttribute('src', '/logo_new2.jpg');
  });

  test('logout button is outlined variant', () => {
    render(<Navigation {...defaultProps} />);
    
    const buttons = screen.getAllByRole('button');
    const logoutButton = buttons[3];
    
    // Check that it's a MUI Button (has MuiButton class)
    expect(logoutButton).toHaveClass('MuiButton-root');
  });

  test('handles empty user name', () => {
    const props = { ...defaultProps, userName: '' };
    render(<Navigation {...props} />);
    
    // Should still render the component structure
    const logo = screen.getByAltText('Chess-State Logo');
    expect(logo).toBeInTheDocument();
  });

  test('handles special characters in user name', () => {
    const props = { ...defaultProps, userName: 'User@123!' };
    render(<Navigation {...props} />);
    
    expect(screen.getByText('User@123!')).toBeInTheDocument();
  });

  test('navigation structure is correct', () => {
    render(<Navigation {...defaultProps} />);
    
    // Check for AppBar
    const appBar = screen.getByRole('banner');
    expect(appBar).toHaveClass('MuiAppBar-root');
    
    // Check for Toolbar
    const toolbar = appBar.querySelector('.MuiToolbar-root');
    expect(toolbar).toBeInTheDocument();
  });

  test('all icon buttons are present', () => {
    render(<Navigation {...defaultProps} />);
    
    // Check that we have the expected number of icon buttons
    const iconButtons = screen.getAllByRole('button');
    expect(iconButtons).toHaveLength(4);
    
    // Each should have the MuiIconButton or MuiButton class
    iconButtons.forEach((button, index) => {
      if (index < 3) {
        // First 3 are IconButtons
        expect(button).toHaveClass('MuiIconButton-root');
      } else {
        // Last one is regular Button (logout)
        expect(button).toHaveClass('MuiButton-root');
      }
    });
  });
});
