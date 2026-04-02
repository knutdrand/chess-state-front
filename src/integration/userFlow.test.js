import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '../App';
import { useAuthStore } from '../stores/authStore';
import { useGameStore } from '../stores/gameStore';
import { useUiStore } from '../stores/uiStore';
import {
  createMockJWTToken,
  createMockInitResponse,
  createMockMoveResponse,
  setupCommonMocks,
  cleanupMocks
} from '../utils/testUtils';

// Mock axios
jest.mock('axios', () => {
  const mockAxiosInstance = {
    post: jest.fn(),
    get: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
  };
  return {
    __esModule: true,
    default: {
      ...mockAxiosInstance,
      create: jest.fn(() => mockAxiosInstance),
    },
    post: jest.fn(),
    get: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  };
});

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
  baseUrl: 'http://localhost:8000',
}));

// Mock the generated API service
jest.mock('../api', () => ({
  DefaultService: {
    initApiInitGet: jest.fn(),
    moveApiMovePost: jest.fn(),
  },
  OpenAPI: {
    BASE: '',
    TOKEN: '',
    HEADERS: {},
  },
}));

const { jwtDecode } = require('jwt-decode');
const { Chess } = require('chess.js');
const { DefaultService } = require('../api');

describe('User Flow Integration Tests', () => {
  let mockChessInstance;

  beforeEach(() => {
    setupCommonMocks();

    // Reset stores
    useAuthStore.setState({ token: null });
    useGameStore.setState({ position: null, gameState: null });
    useUiStore.setState({ activeTab: 'play', boardWidth: 400, screenOrientation: 'column' });

    // Setup Chess mock
    mockChessInstance = {
      fen: jest.fn(() => 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'),
      turn: jest.fn(() => 'w'),
      move: jest.fn(() => ({ from: 'e2', to: 'e4' })),
      undo: jest.fn(),
      get: jest.fn(),
      moves: jest.fn(() => []),
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
    // Mock game initialization response
    const initResponse = {
      fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      mode: 'play',
    };
    DefaultService.initApiInitGet.mockResolvedValue(initResponse);

    // Mock move response
    const moveResponse = {
      state: {
        fen: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1',
        mode: 'play',
      },
      message: null,
    };
    DefaultService.moveApiMovePost.mockResolvedValue(moveResponse);

    // Start with no token (login screen)
    render(<App />);

    // Should show login screen
    expect(screen.getByText('Chess-State')).toBeInTheDocument();
    expect(screen.getByLabelText('Username')).toBeInTheDocument();

    // Simulate login by setting token directly via store
    // (The actual login flow is tested in Login.test.js)
    await waitFor(() => {
      useAuthStore.getState().setToken(createMockJWTToken());
    });

    // Should now show main screen with navigation
    await waitFor(() => {
      expect(screen.getByText('testuser')).toBeInTheDocument();
    });

    // Game should initialize
    await waitFor(() => {
      expect(DefaultService.initApiInitGet).toHaveBeenCalled();
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
      expect(DefaultService.moveApiMovePost).toHaveBeenCalled();
    });
  });

  test('user registration flow', async () => {
    render(<App />);

    // Should show login screen initially
    expect(screen.getByText('Chess-State')).toBeInTheDocument();

    // Click register link
    const registerLink = screen.getByText('Register here');
    fireEvent.click(registerLink);

    // Should show register screen
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Register' })).toBeInTheDocument();
    });
  });

  test('handles authentication error during game', async () => {
    // Setup with valid token
    useAuthStore.setState({ token: createMockJWTToken() });

    // Mock successful initialization
    const initResponse = {
      fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      mode: 'play',
    };
    DefaultService.initApiInitGet.mockResolvedValue(initResponse);

    // Mock authentication error on move
    const authError = { response: { status: 401 } };
    DefaultService.moveApiMovePost.mockRejectedValue(authError);

    render(<App />);

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

  test('app renders without crashing', () => {
    render(<App />);
    expect(document.body).toBeInTheDocument();
  });
});
