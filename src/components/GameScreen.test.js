import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import axios from 'axios';
import { Chess } from 'chess.js';
import { GameScreen } from './GameScreen';

// Mock dependencies
jest.mock('axios', () => ({
  post: jest.fn(),
  get: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
}));
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
jest.mock('./Exploration2', () => ({
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
  apiUrl: 'http://localhost:8000/api',
}));

const mockedAxios = axios;
const MockedChess = Chess;

describe('GameScreen Component', () => {
  const defaultProps = {
    token: 'mock-token',
    setToken: jest.fn(),
    setMode: jest.fn(),
    boardWidth: 400,
    mode: 'play',
    game: null,
    setGame: jest.fn(),
    screenOrientation: 'column',
  };

  const mockChessInstance = {
    fen: jest.fn(() => 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'),
    turn: jest.fn(() => 'w'),
    move: jest.fn(),
    undo: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    MockedChess.mockImplementation(() => mockChessInstance);
  });

  test('renders loading state when no game is present', () => {
    render(<GameScreen {...defaultProps} />);
    
    // Should render the component structure
    expect(screen.getByTestId('chessboard')).toBeInTheDocument();
  });

  test('initializes game when token is provided and no game exists', async () => {
    const mockResponse = {
      data: {
        board: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
        line: { moves: ['e4', 'e5'] },
        success: true,
      },
    };

    mockedAxios.get.mockResolvedValue(mockResponse);

    render(<GameScreen {...defaultProps} />);

    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalledWith(
        'http://localhost:8000/api/init',
        {
          headers: {
            accept: 'application/json',
            Authorization: 'Bearer mock-token',
          },
        }
      );
    });

    await waitFor(() => {
      expect(defaultProps.setGame).toHaveBeenCalled();
    });
  });

  test('handles initialization failure', async () => {
    const mockResponse = {
      data: {
        success: false,
      },
    };

    mockedAxios.get.mockResolvedValue(mockResponse);

    render(<GameScreen {...defaultProps} />);

    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalled();
    });
  });

  test('handles initialization error', async () => {
    mockedAxios.get.mockRejectedValue(new Error('Network error'));

    render(<GameScreen {...defaultProps} />);

    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalled();
    });
  });

  test('renders PlayerStatus in play mode', () => {
    const gameInstance = { ...mockChessInstance };
    const props = { ...defaultProps, game: gameInstance, mode: 'play' };

    render(<GameScreen {...props} />);

    expect(screen.getByTestId('player-status')).toBeInTheDocument();
    expect(screen.queryByTestId('info')).not.toBeInTheDocument();
  });

  test('renders Info component in non-play mode', () => {
    const gameInstance = { ...mockChessInstance };
    const props = { ...defaultProps, game: gameInstance, mode: 'show' };

    render(<GameScreen {...props} />);

    expect(screen.getByTestId('info')).toBeInTheDocument();
    expect(screen.queryByTestId('player-status')).not.toBeInTheDocument();
  });

  test('handles piece drop', async () => {
    const gameInstance = {
      ...mockChessInstance,
      move: jest.fn(() => ({ from: 'e2', to: 'e4' })),
    };
    const props = { ...defaultProps, game: gameInstance };

    const mockResponse = {
      data: {
        board: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1',
        mode: 'play',
        line: { moves: ['e5'] },
        white_score: 1,
        black_score: 0,
      },
    };

    mockedAxios.post.mockResolvedValue(mockResponse);

    render(<GameScreen {...props} />);

    const pieceDropButton = screen.getByTestId('mock-piece-drop');
    fireEvent.click(pieceDropButton);

    await waitFor(() => {
      expect(gameInstance.move).toHaveBeenCalledWith({
        from: 'e2',
        to: 'e4',
        promotion: 'q',
      });
    });
  });

  test('handles invalid piece drop', () => {
    const gameInstance = {
      ...mockChessInstance,
      move: jest.fn(() => null), // Invalid move
    };
    const props = { ...defaultProps, game: gameInstance };

    render(<GameScreen {...props} />);

    const pieceDropButton = screen.getByTestId('mock-piece-drop');
    fireEvent.click(pieceDropButton);

    expect(gameInstance.move).toHaveBeenCalled();
  });

  test('handles square click for move selection', () => {
    const gameInstance = { ...mockChessInstance };
    const props = { ...defaultProps, game: gameInstance };

    render(<GameScreen {...props} />);

    const squareClickButton = screen.getByTestId('mock-square-click');
    
    // First click selects square
    fireEvent.click(squareClickButton);
    
    // Second click should attempt move (but will fail in this mock)
    fireEvent.click(squareClickButton);
  });

  test('enters exploration mode when explanation button is clicked', () => {
    const gameInstance = { ...mockChessInstance };
    const props = { ...defaultProps, game: gameInstance, mode: 'show' };

    render(<GameScreen {...props} />);

    const explanationButton = screen.getByTestId('explanation-button');
    fireEvent.click(explanationButton);

    expect(screen.getByTestId('api-exploration')).toBeInTheDocument();
  });

  test('exits exploration mode', () => {
    const gameInstance = { ...mockChessInstance };
    const props = { ...defaultProps, game: gameInstance, mode: 'show' };

    render(<GameScreen {...props} />);

    // Enter exploration mode
    const explanationButton = screen.getByTestId('explanation-button');
    fireEvent.click(explanationButton);

    // Exit exploration mode
    const exitButton = screen.getByTestId('exit-exploration');
    fireEvent.click(exitButton);

    expect(screen.queryByTestId('api-exploration')).not.toBeInTheDocument();
    expect(screen.getByTestId('chessboard')).toBeInTheDocument();
  });

  test('handles authentication error in move request', async () => {
    const gameInstance = {
      ...mockChessInstance,
      move: jest.fn(() => ({ from: 'e2', to: 'e4' })),
    };
    const props = { ...defaultProps, game: gameInstance };

    const authError = {
      response: { status: 401 },
    };

    mockedAxios.post.mockRejectedValue(authError);

    render(<GameScreen {...props} />);

    const pieceDropButton = screen.getByTestId('mock-piece-drop');
    fireEvent.click(pieceDropButton);

    await waitFor(() => {
      expect(defaultProps.setToken).toHaveBeenCalledWith(null);
    });
  });
});
