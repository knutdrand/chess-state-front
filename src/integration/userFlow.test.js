import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../App';
import { useAuthStore } from '../stores/authStore';
import { useGameStore } from '../stores/gameStore';
import { useUiStore } from '../stores/uiStore';
import {
  createMockJWTToken,
  setupCommonMocks,
  cleanupMocks
} from '../utils/testUtils';
import { jwtDecode } from 'jwt-decode';
import { Chess } from 'chess.js';
import axios from 'axios';
import { DefaultService } from '../api';
// '../api' is mocked, so load httpClient explicitly to register its interceptors.
import '../httpClient';

// Mock axios
vi.mock('axios', () => {
  const mockAxiosInstance = {
    post: vi.fn(),
    get: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  };
  return {
    __esModule: true,
    default: {
      ...mockAxiosInstance,
      create: vi.fn(() => mockAxiosInstance),
      isAxiosError: (e) => Boolean(e && e.isAxiosError),
    },
    isAxiosError: (e) => Boolean(e && e.isAxiosError),
    post: vi.fn(),
    get: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  };
});

// react-d3-tree pulls in ESM-only d3 packages that Jest cannot parse
vi.mock('react-d3-tree', () => ({
  __esModule: true,
  default: () => <div data-testid="tree" />,
}));

// Mock jwt-decode
vi.mock('jwt-decode', () => ({
  jwtDecode: vi.fn(),
}));

// Mock chess.js
vi.mock('chess.js', () => ({
  Chess: vi.fn(),
}));

// Mock react-chessboard
vi.mock('react-chessboard', () => ({
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
vi.mock('../config', () => ({
  apiUrl: 'http://localhost:8000/api',
  baseUrl: 'http://localhost:8000',
}));

// Mock the generated API service
vi.mock('../api', () => ({
  DefaultService: {
    initApiInitGet: vi.fn(),
    moveApiMovePost: vi.fn(),
  },
  OpenAPI: {
    BASE: '',
    TOKEN: '',
    HEADERS: {},
  },
}));


// The 401 handler httpClient registers on its axios instance at import time.
// Captured here, before any beforeEach/afterEach clears mock call records.
const httpClientInstance = axios.create.mock.results[0].value;
const responseErrorInterceptor =
  httpClientInstance.interceptors.response.use.mock.calls[0][1];

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
      fen: vi.fn(() => 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'),
      turn: vi.fn(() => 'w'),
      move: vi.fn(() => ({ from: 'e2', to: 'e4' })),
      undo: vi.fn(),
      get: vi.fn(),
      moves: vi.fn(() => []),
    };
    Chess.mockImplementation(function () { return mockChessInstance; });

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

    // Mock authentication error on move: simulate the request going through
    // httpClient's response interceptor, as the generated client does.
    const authError = { isAxiosError: true, response: { status: 401 } };
    DefaultService.moveApiMovePost.mockImplementation(() =>
      responseErrorInterceptor(authError)
    );

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
