import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Navigation } from './Navigation';
import { useAuthStore } from '../stores/authStore';
import { useUiStore } from '../stores/uiStore';

// Mock jwt-decode
jest.mock('jwt-decode', () => ({
  jwtDecode: jest.fn(() => ({ sub: 'TestUser', exp: 9999999999 })),
}));

const { jwtDecode: mockedJwtDecode } = require('jwt-decode');

describe('Navigation Component', () => {
  beforeEach(() => {
    mockedJwtDecode.mockReturnValue({ sub: 'TestUser', exp: 9999999999 });
    useAuthStore.setState({ token: 'mock-token' });
    useUiStore.setState({ activeTab: 'play' });
  });

  test('renders with user name and logo', () => {
    render(<Navigation />);

    expect(screen.getByText('TestUser')).toBeInTheDocument();

    const logo = screen.getByAltText('Chess-State Logo');
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute('src', '/logo_new2.jpg');
  });

  test('renders all navigation buttons', () => {
    render(<Navigation />);

    const buttons = screen.getAllByRole('button');
    // 3 icon buttons (play, courses, settings) + 1 logout button
    expect(buttons).toHaveLength(4);
  });

  test('calls setActiveTab when play tab is clicked', () => {
    useUiStore.setState({ activeTab: 'courses' });
    render(<Navigation />);

    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[0]); // play

    expect(useUiStore.getState().activeTab).toBe('play');
  });

  test('calls setActiveTab when courses tab is clicked', () => {
    render(<Navigation />);

    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[1]); // courses

    expect(useUiStore.getState().activeTab).toBe('courses');
  });

  test('calls setActiveTab when settings tab is clicked', () => {
    render(<Navigation />);

    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[2]); // settings

    expect(useUiStore.getState().activeTab).toBe('settings');
  });

  test('calls logout when logout button is clicked', () => {
    render(<Navigation />);

    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[3]); // logout

    expect(useAuthStore.getState().token).toBeNull();
  });

  test('renders with different user name', () => {
    mockedJwtDecode.mockReturnValue({ sub: 'AnotherUser', exp: 9999999999 });

    render(<Navigation />);

    expect(screen.getByText('AnotherUser')).toBeInTheDocument();
    expect(screen.queryByText('TestUser')).not.toBeInTheDocument();
  });

  test('navigation structure is correct', () => {
    render(<Navigation />);

    const appBar = screen.getByRole('banner');
    expect(appBar).toHaveClass('MuiAppBar-root');

    const toolbar = appBar.querySelector('.MuiToolbar-root');
    expect(toolbar).toBeInTheDocument();
  });

  test('icon buttons have correct classes', () => {
    render(<Navigation />);

    const iconButtons = screen.getAllByRole('button');
    // First 3 are IconButtons
    for (let i = 0; i < 3; i++) {
      expect(iconButtons[i]).toHaveClass('MuiIconButton-root');
    }
    // Last one is regular Button (logout)
    expect(iconButtons[3]).toHaveClass('MuiButton-root');
  });
});
