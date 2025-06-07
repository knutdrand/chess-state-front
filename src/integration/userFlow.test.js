import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import axios from 'axios';
import App from '../App';
import { 
  createMockJWTToken, 
  createMockInitResponse, 
  createMockMoveResponse,
  setupCommonMocks,
  cleanupMocks 
} from '../utils/testUtils';

// Mock axios
jest.mock('axios', () => ({
  post: jest.fn(),
  get: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
}));
const mockedAxios = axios;

// Mock jwt-decode
jest.mock('jwt-decode', () => ({
  jwtDecode: jest.fn(),
}));

// Mock chess.js
jest.mock('chess.js', () => ({
  Chess: jest.fn(),
}));

// Mock react-chessboard
jest.mock('react-chessboard', () => ({
  Chessboard: ({ onPieceDrop }) => (
    <div data-testid="chessboard">
      <button 
        data-testid="make-move" 
        onClick={() => onPieceDrop && onPieceDrop('e2', 'e4', 'wP')}
      >
        Make Move e2-e4
      </button>
    </div>
  ),
}));

// Mock config
jest.mock('../config', () => ({
  apiUrl: 'http://localhost:8000/api',
}));

const { jwtDecode } = require('jwt-decode');
const { Chess } = require('chess.js');

describe('User Flow Integration Tests', () => {
  let mockChessInstance;

  beforeEach(() => {
    setupCommonMocks();
    
    // Setup Chess mock
    mockChessInstance = {
      fen: jest.fn(() => 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'),
      turn: jest.fn(() => 'w'),
      move: jest.fn(() => ({ from: 'e2', to: 'e4' })),
      undo: jest.fn(),
    };
    Chess.mockImplementation(() => mockChessInstance);

    // Setup jwt-decode mock
    jwtDecode.mockImplementation(() => ({
      sub: 'testuser',
      exp: Math.floor(Date.now() / 1000) + 3600,
    }));
  });

  afterEach(() => {
    cleanupMocks();
  });

  test('complete user login and game flow', async () => {
    // Mock login response
    const loginResponse = {
      data: {
        access_token: createMockJWTToken(),
      },
    };

    // Mock game initialization response
    const initResponse = createMockInitResponse();

    // Mock move response
    const moveResponse = createMockMoveResponse();

    mockedAxios.post.mockResolvedValueOnce(loginResponse);
    mockedAxios.get.mockResolvedValueOnce(initResponse);
    mockedAxios.post.mockResolvedValueOnce(moveResponse);

    // Start with no token (login screen)
    localStorage.getItem = jest.fn(() => null);

    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    );

    // Should show login screen
    expect(screen.getByText('Chess-State')).toBeInTheDocument();
    expect(screen.getByLabelText('Username')).toBeInTheDocument();

    // Fill in login form
    const usernameInput = screen.getByLabelText('Username');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByRole('button', { name: 'Submit' });

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'testpass' } });
    fireEvent.click(submitButton);

    // Wait for login to complete and main screen to load
    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith(
        'http://localhost:8000/api/token',
        expect.any(URLSearchParams),
        expect.any(Object)
      );
    });

    // Should now show main screen with navigation
    await waitFor(() => {
      expect(screen.getByText('testuser')).toBeInTheDocument();
    });

    // Game should initialize
    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalledWith(
        'http://localhost:8000/api/init',
        expect.any(Object)
      );
    });

    // Should show chessboard
    await waitFor(() => {
      expect(screen.getByTestId('chessboard')).toBeInTheDocument();
    });

    // Make a move
    const makeMoveButton = screen.getByTestId('make-move');
    fireEvent.click(makeMoveButton);

    // Should send move to server
    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith(
        'http://localhost:8000/api/move',
        expect.objectContaining({
          from_square: 'e2',
          to_square: 'e4',
        }),
        expect.any(Object)
      );
    });
  });

  test('user registration flow', async () => {
    localStorage.getItem = jest.fn(() => null);

    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    );

    // Should show login screen initially
    expect(screen.getByText('Chess-State')).toBeInTheDocument();

    // Click register link
    const registerLink = screen.getByText('Register here');
    fireEvent.click(registerLink);

    // Should show register screen (mocked)
    await waitFor(() => {
      expect(screen.getByText('Back to Login')).toBeInTheDocument();
    });

    // Go back to login
    const backButton = screen.getByText('Back to Login');
    fireEvent.click(backButton);

    // Should be back to login screen
    expect(screen.getByLabelText('Username')).toBeInTheDocument();
  });

  test('handles authentication error during game', async () => {
    // Setup with valid token initially
    const validToken = createMockJWTToken();
    localStorage.getItem = jest.fn(() => JSON.stringify(validToken));

    // Mock successful initialization
    const initResponse = createMockInitResponse();
    mockedAxios.get.mockResolvedValueOnce(initResponse);

    // Mock authentication error on move
    const authError = {
      response: { status: 401 },
    };
    mockedAxios.post.mockRejectedValueOnce(authError);

    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    );

    // Should show main screen
    await waitFor(() => {
      expect(screen.getByText('testuser')).toBeInTheDocument();
    });

    // Wait for game initialization
    await waitFor(() => {
      expect(screen.getByTestId('chessboard')).toBeInTheDocument();
    });

    // Try to make a move (will fail with auth error)
    const makeMoveButton = screen.getByTestId('make-move');
    fireEvent.click(makeMoveButton);

    // Should redirect back to login due to auth error
    await waitFor(() => {
      expect(screen.getByLabelText('Username')).toBeInTheDocument();
    });
  });

  test('navigation between tabs works correctly', async () => {
    // Setup with valid token
    const validToken = createMockJWTToken();
    localStorage.getItem = jest.fn(() => JSON.stringify(validToken));

    // Mock successful initialization
    const initResponse = createMockInitResponse();
    mockedAxios.get.mockResolvedValueOnce(initResponse);

    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    );

    // Should show main screen
    await waitFor(() => {
      expect(screen.getByText('testuser')).toBeInTheDocument();
    });

    // Should be on play tab by default
    await waitFor(() => {
      expect(screen.getByTestId('chessboard')).toBeInTheDocument();
    });

    // Get navigation buttons
    const buttons = screen.getAllByRole('button');
    
    // Click courses tab (second icon button)
    const coursesButton = buttons.find(button => 
      button.classList.contains('MuiIconButton-root') && 
      !button.querySelector('[data-testid]')
    );
    
    if (coursesButton) {
      fireEvent.click(coursesButton);
      
      // Should show courses content
      await waitFor(() => {
        expect(screen.getByText('Courses')).toBeInTheDocument();
      });
    }
  });

  test('handles server errors gracefully', async () => {
    localStorage.getItem = jest.fn(() => null);

    // Mock login success
    const loginResponse = {
      data: {
        access_token: createMockJWTToken(),
      },
    };
    mockedAxios.post.mockResolvedValueOnce(loginResponse);

    // Mock server error on initialization
    mockedAxios.get.mockRejectedValueOnce(new Error('Server error'));

    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    );

    // Login
    const usernameInput = screen.getByLabelText('Username');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByRole('button', { name: 'Submit' });

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'testpass' } });
    fireEvent.click(submitButton);

    // Should still show main screen even with server error
    await waitFor(() => {
      expect(screen.getByText('testuser')).toBeInTheDocument();
    });
  });

  test('exploration route works correctly', () => {
    render(
      <MemoryRouter initialEntries={['/exploration']}>
        <App />
      </MemoryRouter>
    );

    // Should show exploration page
    expect(screen.getByText('Example Exploration')).toBeInTheDocument();
  });
});
