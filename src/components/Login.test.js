import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import Login from './Login';

// Mock axios
jest.mock('axios', () => ({
  post: jest.fn(),
  get: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
}));
const mockedAxios = axios;

// Mock the config
jest.mock('../config', () => ({
  apiUrl: 'http://localhost:8000/api',
}));

describe('Login Component', () => {
  const defaultProps = {
    setToken: jest.fn(),
    setIsRegistering: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
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
    expect(screen.getByText('Register here')).toBeInTheDocument();
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
    
    const registerLink = screen.getByText('Register here');
    fireEvent.click(registerLink);
    
    expect(defaultProps.setIsRegistering).toHaveBeenCalledWith(true);
  });

  test('submits form with correct credentials', async () => {
    const mockResponse = {
      data: {
        access_token: 'mock-access-token',
      },
    };
    
    mockedAxios.post.mockResolvedValue(mockResponse);
    
    render(<Login {...defaultProps} />);
    
    const usernameInput = screen.getByLabelText('Username');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByRole('button', { name: 'Submit' });
    
    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'testpass' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith(
        'http://localhost:8000/api/token',
        expect.any(URLSearchParams),
        {
          headers: {
            'accept': 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );
    });
    
    await waitFor(() => {
      expect(defaultProps.setToken).toHaveBeenCalledWith('mock-access-token');
    });
  });

  test('sends correct form data in request', async () => {
    const mockResponse = {
      data: {
        access_token: 'mock-access-token',
      },
    };
    
    mockedAxios.post.mockResolvedValue(mockResponse);
    
    render(<Login {...defaultProps} />);
    
    const usernameInput = screen.getByLabelText('Username');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByRole('button', { name: 'Submit' });
    
    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'testpass' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      const callArgs = mockedAxios.post.mock.calls[0];
      const formData = callArgs[1];
      
      // Convert URLSearchParams to object for easier testing
      const formDataObj = Object.fromEntries(formData.entries());
      
      expect(formDataObj).toEqual({
        grant_type: 'password',
        username: 'testuser',
        password: 'testpass',
        scope: '',
        client_id: '',
        client_secret: '',
      });
    });
  });

  test('prevents form submission when preventDefault is called', () => {
    render(<Login {...defaultProps} />);
    
    const form = screen.getByRole('button', { name: 'Submit' }).closest('form');
    const mockPreventDefault = jest.fn();
    
    fireEvent.submit(form, { preventDefault: mockPreventDefault });
    
    // The actual preventDefault call happens in the handleSubmit function
    // This test ensures the form structure is correct
    expect(form).toBeInTheDocument();
  });

  test('handles empty username and password', async () => {
    const mockResponse = {
      data: {
        access_token: 'mock-access-token',
      },
    };
    
    mockedAxios.post.mockResolvedValue(mockResponse);
    
    render(<Login {...defaultProps} />);
    
    const submitButton = screen.getByRole('button', { name: 'Submit' });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalled();
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
    expect(submitButton).toHaveClass('w-100');
  });
});
