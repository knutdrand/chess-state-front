import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Login from './Login';
import { useAuthStore } from '../../stores/authStore';
import { DefaultService } from '../../api';

// Mock the generated API service
jest.mock('../../api', () => ({
  DefaultService: {
    loginForAccessTokenApiTokenPost: jest.fn(),
  },
}));

describe('Login Component', () => {
  const defaultProps = {
    setIsRegistering: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    useAuthStore.setState({ token: null });
  });

  test('renders login form with all elements', () => {
    render(<Login {...defaultProps} />);

    // Check for logo
    const logo = screen.getByAltText('Chess-State Logo');
    expect(logo).toBeInTheDocument();

    // Check for title
    expect(screen.getByText('Chess-State')).toBeInTheDocument();

    // Check for form fields
    expect(screen.getByLabelText('Username')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();

    // Check for submit button
    expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument();

    // Check for register link
    expect(screen.getByRole('button', { name: 'Register here' })).toBeInTheDocument();
  });

  test('allows user to enter username and password', () => {
    render(<Login {...defaultProps} />);

    const usernameInput = screen.getByLabelText('Username');
    const passwordInput = screen.getByLabelText('Password');

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'testpass' } });

    expect(usernameInput.value).toBe('testuser');
    expect(passwordInput.value).toBe('testpass');
  });

  test('calls setIsRegistering when register link is clicked', () => {
    render(<Login {...defaultProps} />);

    const registerLink = screen.getByRole('button', { name: 'Register here' });
    fireEvent.click(registerLink);

    expect(defaultProps.setIsRegistering).toHaveBeenCalledWith(true);
  });

  test('submits form and sets token via store', async () => {
    DefaultService.loginForAccessTokenApiTokenPost.mockResolvedValue({
      access_token: 'mock-access-token',
    });

    render(<Login {...defaultProps} />);

    const usernameInput = screen.getByLabelText('Username');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByRole('button', { name: 'Submit' });

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'testpass' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(DefaultService.loginForAccessTokenApiTokenPost).toHaveBeenCalledWith({
        username: 'testuser',
        password: 'testpass',
      });
    });

    await waitFor(() => {
      expect(useAuthStore.getState().token).toBe('mock-access-token');
    });
  });

  test('shows error on login failure', async () => {
    DefaultService.loginForAccessTokenApiTokenPost.mockRejectedValue(
      new Error('Invalid credentials')
    );

    render(<Login {...defaultProps} />);

    const usernameInput = screen.getByLabelText('Username');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByRole('button', { name: 'Submit' });

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpass' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Invalid username or password')).toBeInTheDocument();
    });
  });

  test('form inputs have correct types and placeholders', () => {
    render(<Login {...defaultProps} />);

    const usernameInput = screen.getByLabelText('Username');
    const passwordInput = screen.getByLabelText('Password');

    expect(usernameInput).toHaveAttribute('type', 'text');
    expect(usernameInput).toHaveAttribute('placeholder', 'Enter username');

    expect(passwordInput).toHaveAttribute('type', 'password');
    expect(passwordInput).toHaveAttribute('placeholder', 'Password');
  });

  test('submit button spans full width', () => {
    render(<Login {...defaultProps} />);

    const submitButton = screen.getByRole('button', { name: 'Submit' });
    expect(submitButton).toBeInTheDocument();
  });
});
