// Test utilities for chess application
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

/**
 * Creates a mock JWT token for testing
 * @param {Object} payload - The payload to encode in the token
 * @param {number} expirationOffset - Offset in seconds from current time for expiration
 * @returns {string} Mock JWT token
 */
export const createMockJWTToken = (payload = {}, expirationOffset = 3600) => {
  const defaultPayload = {
    sub: 'testuser',
    exp: Math.floor(Date.now() / 1000) + expirationOffset,
    iat: Math.floor(Date.now() / 1000),
    ...payload,
  };
  
  // Create a simple mock token (not a real JWT, just for testing)
  return `mock.${btoa(JSON.stringify(defaultPayload))}.signature`;
};

/**
 * Creates a mock Chess.js game instance
 * @param {string} fen - FEN string for the position
 * @returns {Object} Mock chess game instance
 */
export const createMockChessGame = (fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1') => ({
  fen: vi.fn(() => fen),
  turn: vi.fn(() => fen.split(' ')[1]),
  move: vi.fn(),
  undo: vi.fn(),
  isGameOver: vi.fn(() => false),
  isCheck: vi.fn(() => false),
  isCheckmate: vi.fn(() => false),
  isDraw: vi.fn(() => false),
  moves: vi.fn(() => []),
  history: vi.fn(() => []),
  pgn: vi.fn(() => ''),
  ascii: vi.fn(() => ''),
});

/**
 * Creates mock API response for game initialization
 * @param {Object} overrides - Properties to override in the response
 * @returns {Object} Mock API response
 */
export const createMockInitResponse = (overrides = {}) => ({
  data: {
    board: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    line: { moves: ['e4', 'e5'] },
    success: true,
    mode: 'play',
    white_score: 0,
    black_score: 0,
    message: 'Game initialized',
    ...overrides,
  },
});

/**
 * Creates mock API response for move submission
 * @param {Object} overrides - Properties to override in the response
 * @returns {Object} Mock API response
 */
export const createMockMoveResponse = (overrides = {}) => ({
  data: {
    board: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1',
    mode: 'play',
    line: { moves: ['e5'] },
    white_score: 1,
    black_score: 0,
    correct_move: 'e4',
    message: 'Good move!',
    success: true,
    ...overrides,
  },
});

/**
 * Creates mock course data for testing
 * @param {Object} overrides - Properties to override
 * @returns {Array} Mock courses array
 */
export const createMockCourses = (overrides = {}) => [
  {
    id: '1',
    name: 'Basic Tactics',
    enabled: true,
    chapters: [
      {
        id: '1-1',
        name: 'Pins and Forks',
        enabled: true,
      },
      {
        id: '1-2',
        name: 'Discovered Attacks',
        enabled: false,
      },
    ],
    ...overrides,
  },
  {
    id: '2',
    name: 'Endgame Fundamentals',
    enabled: false,
    chapters: [
      {
        id: '2-1',
        name: 'King and Pawn',
        enabled: true,
      },
    ],
  },
];

/**
 * Creates mock exploration data
 * @param {Object} overrides - Properties to override
 * @returns {Object} Mock exploration response
 */
export const createMockExplorationResponse = (overrides = {}) => ({
  data: {
    explanations: [
      {
        fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
        explanation: 'This is the starting position of a chess game.',
      },
      {
        fen: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1',
        explanation: 'White opens with the King\'s Pawn.',
      },
    ],
    cur_index: 0,
    ...overrides,
  },
});

/**
 * Mock localStorage for testing
 */
export const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

/**
 * Sets up common mocks for testing
 */
export const setupCommonMocks = () => {
  // Mock localStorage
  Object.defineProperty(global, 'localStorage', {
    value: mockLocalStorage,
    writable: true,
  });

  // Mock console methods to reduce noise in tests
  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});

  // Mock window.innerWidth and window.innerHeight
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: 1024,
  });

  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: 768,
  });
};

/**
 * Cleans up mocks after tests
 */
export const cleanupMocks = () => {
  vi.clearAllMocks();
  vi.restoreAllMocks();
};

/**
 * Custom render function with common providers
 * @param {ReactElement} ui - Component to render
 * @param {Object} options - Render options
 * @returns {Object} Render result
 */
export const renderWithProviders = (ui, options = {}) => {
  
  const Wrapper = ({ children }) => (
    <MemoryRouter initialEntries={options.initialEntries || ['/']}>
      {children}
    </MemoryRouter>
  );

  return render(ui, { wrapper: Wrapper, ...options });
};

/**
 * Waits for async operations to complete
 * @param {number} ms - Milliseconds to wait
 * @returns {Promise} Promise that resolves after the specified time
 */
export const waitFor = (ms = 0) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Creates a mock event object
 * @param {Object} overrides - Properties to override
 * @returns {Object} Mock event object
 */
export const createMockEvent = (overrides = {}) => ({
  preventDefault: vi.fn(),
  stopPropagation: vi.fn(),
  target: {
    value: '',
    name: '',
    ...overrides.target,
  },
  ...overrides,
});
