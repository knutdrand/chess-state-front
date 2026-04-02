import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { Chess } from 'chess.js';
import { GameScreen } from './GameScreen';
import { useAuthStore } from '../stores/authStore';
import { useUiStore } from '../stores/uiStore';
import { useGameStore } from '../stores/gameStore';

// Mock dependencies
jest.mock('chess.js');
jest.mock('jwt-decode', () => ({
  jwtDecode: jest.fn(() => ({ sub: 'testuser' })),
}));

// Mock the Chessboard component
jest.mock('react-chessboard', () => ({
  Chessboard: ({ position, onPieceDrop, onSquareClick, boardOrientation }) => (
    <div data-testid="chessboard">
      <div data-testid="position">{position}</div>
      <div data-testid="orientation">{boardOrientation}</div>
      <button
        data-testid="mock-piece-drop"
        onClick={() => onPieceDrop && onPieceDrop('e2', 'e4', 'wP')}
      >
        Mock Piece Drop
      </button>
      <button
        data-testid="mock-square-click"
        onClick={() => onSquareClick && onSquareClick('e2')}
      >
        Mock Square Click
      </button>
    </div>
  ),
}));

// Mock PlayerStatus component
jest.mock('./PlayerStatus', () => ({
  PlayerStatus: ({ score, onSolution }) => (
    <div data-testid="player-status">
      <span data-testid="score">{score}</span>
      <button data-testid="solution-button" onClick={onSolution}>
        Solution
      </button>
    </div>
  ),
}));

// Mock Info component
jest.mock('./Info', () => ({
  Info: ({ mode, feedback, link, onExplanation }) => (
    <div data-testid="info">
      <span data-testid="mode">{mode}</span>
      <span data-testid="feedback">{feedback}</span>
      <span data-testid="link">{link}</span>
      <button data-testid="explanation-button" onClick={onExplanation}>
        Explanation
      </button>
    </div>
  ),
}));

// Mock ApiExploration component
jest.mock('./ExplorationModern', () => ({
  ApiExploration: ({ fen, onExit }) => (
    <div data-testid="api-exploration">
      <span data-testid="exploration-fen">{fen}</span>
      <button data-testid="exit-exploration" onClick={onExit}>
        Exit
      </button>
    </div>
  ),
}));

// Mock config
jest.mock('../config', () => ({
  baseUrl: 'http://localhost:8000',
  apiUrl: 'http://localhost:8000/api',
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

const { DefaultService } = require('../api');
const MockedChess = Chess;

describe('GameScreen Component', () => {
  const mockChessInstance = {
    fen: jest.fn(() => 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'),
    turn: jest.fn(() => 'w'),
    move: jest.fn(),
    undo: jest.fn(),
    get: jest.fn(),
    moves: jest.fn(() => []),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    MockedChess.mockImplementation(() => mockChessInstance);

    // Reset stores to default state
    useAuthStore.setState({ token: 'mock-token' });
    useUiStore.setState({ boardWidth: 400, screenOrientation: 'column' });
    useGameStore.setState({ position: null, gameState: null });
  });

  test('shows loading when initializing game', async () => {
    DefaultService.initApiInitGet.mockImplementation(() => new Promise(() => {})); // never resolves

    render(<GameScreen />);

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  test('initializes game on mount when no position exists', async () => {
    const mockResponse = {
      fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      mode: 'play',
    };

    DefaultService.initApiInitGet.mockResolvedValue(mockResponse);

    render(<GameScreen />);

    await waitFor(() => {
      expect(DefaultService.initApiInitGet).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(useGameStore.getState().position).toBe(mockResponse.fen);
      expect(useGameStore.getState().gameState).toEqual(mockResponse);
    });
  });

  test('renders chessboard when position exists', async () => {
    const fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
    useGameStore.setState({
      position: fen,
      gameState: { fen, mode: 'play' }
    });
    DefaultService.initApiInitGet.mockResolvedValue({ fen, mode: 'play' });

    render(<GameScreen />);

    expect(screen.getByTestId('chessboard')).toBeInTheDocument();
  });

  test('handles piece drop', async () => {
    const fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
    useGameStore.setState({
      position: fen,
      gameState: { fen, mode: 'play' }
    });

    mockChessInstance.move.mockReturnValue({ from: 'e2', to: 'e4' });
    mockChessInstance.fen.mockReturnValue('rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1');

    const mockMoveResponse = {
      state: {
        fen: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1',
        mode: 'play'
      },
      message: null,
    };
    DefaultService.moveApiMovePost.mockResolvedValue(mockMoveResponse);

    render(<GameScreen />);

    const pieceDropButton = screen.getByTestId('mock-piece-drop');
    fireEvent.click(pieceDropButton);

    await waitFor(() => {
      expect(mockChessInstance.move).toHaveBeenCalledWith({
        from: 'e2',
        to: 'e4',
        promotion: 'q',
      });
    });
  });

  test('handles authentication error by logging out', async () => {
    const fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
    useGameStore.setState({
      position: fen,
      gameState: { fen, mode: 'play' }
    });

    mockChessInstance.move.mockReturnValue({ from: 'e2', to: 'e4' });

    const authError = { response: { status: 401 } };
    DefaultService.moveApiMovePost.mockRejectedValue(authError);

    render(<GameScreen />);

    const pieceDropButton = screen.getByTestId('mock-piece-drop');
    fireEvent.click(pieceDropButton);

    await waitFor(() => {
      expect(useAuthStore.getState().token).toBeNull();
    });
  });

  test('enters exploration mode when explanation button is clicked', () => {
    const fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
    useGameStore.setState({
      position: fen,
      gameState: { fen, mode: 'show' }
    });

    render(<GameScreen />);

    const explanationButton = screen.getByTestId('explanation-button');
    fireEvent.click(explanationButton);

    expect(screen.getByTestId('api-exploration')).toBeInTheDocument();
  });

  test('exits exploration mode', () => {
    const fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
    useGameStore.setState({
      position: fen,
      gameState: { fen, mode: 'show' }
    });

    render(<GameScreen />);

    // Enter exploration mode
    const explanationButton = screen.getByTestId('explanation-button');
    fireEvent.click(explanationButton);

    // Exit exploration mode
    const exitButton = screen.getByTestId('exit-exploration');
    fireEvent.click(exitButton);

    expect(screen.queryByTestId('api-exploration')).not.toBeInTheDocument();
    expect(screen.getByTestId('chessboard')).toBeInTheDocument();
  });
});
