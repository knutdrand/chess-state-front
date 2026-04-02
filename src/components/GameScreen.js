import React, { useState, useEffect, useCallback } from "react";
import { Chess } from 'chess.js';
import { Chessboard } from "react-chessboard";
import { Box, CircularProgress } from "@mui/material";
import { DefaultService, OpenAPI } from "../api";
import { Info } from "./Info";
import { ApiExploration } from "./ExplorationModern";
import { baseUrl } from '../config';
import { useAuthStore } from '../stores/authStore';
import { useUiStore } from '../stores/uiStore';
import { useGameStore } from '../stores/gameStore';

export function GameScreen() {
  const token = useAuthStore((s) => s.token);
  const logout = useAuthStore((s) => s.logout);
  const boardWidth = useUiStore((s) => s.boardWidth);
  const screenOrientation = useUiStore((s) => s.screenOrientation);
  const position = useGameStore((s) => s.position);
  const setPosition = useGameStore((s) => s.setPosition);
  const gameState = useGameStore((s) => s.gameState);
  const setGameState = useGameStore((s) => s.setGameState);

  // UI state
  const [loading, setLoading] = useState(false);
  const [recieveTimeStamp, setRecieveTimeStamp] = useState(null);
  const [explanation, setExplanation] = useState(null);
  const [infoAnimationKey, setInfoAnimationKey] = useState(0);
  const [showExploration, setShowExploration] = useState(false);

  // Square highlighting state
  const [squareStyles, setSquareStyles] = useState({
    moveSquares: {},
    optionSquares: {},
    rightClickedSquares: {}
  });
  const [showSquares, setShowSquares] = useState([]);
  console.log('reload', position);
  // Configure the API with the token
  useEffect(() => {
    OpenAPI.BASE = baseUrl;
    OpenAPI.TOKEN = token;
    OpenAPI.HEADERS = {
      'Authorization': `Bearer ${token}`
    };
  }, [token]);

  // itialize game if not already initialized
  useEffect(() => {
    if (position){
      console.log('already have a game', position);
    }
    if (!position) {
      initGame();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getOrientation= (fen) => {
    const game = new Chess(fen);
    return game.turn() === 'w' ? 'white' : 'black';
  }

  const initGame = async () => {
    setLoading(true);
    try {
      const response = await DefaultService.initApiInitGet();
      console.log('init', response);
      setPosition(response.fen);
      setRecieveTimeStamp(Date.now())
      setGameState(response);
    } catch (error) {
      console.error("Error initializing game:", error);
      if (error.response && error.response.status === 401) {
        logout();
      }
    } finally {
      setLoading(false);
    }
  };

  const makeMove = useCallback(async (move) => {
    const currentPosition = useGameStore.getState().position;
    const currentGameState = useGameStore.getState().gameState;

    if (!currentPosition) {
      console.log('no game');
      return;
    }

    try {
      const gameCopy = new Chess(currentPosition);
      const result = gameCopy.move(move);

      if (result) {
        setPosition(gameCopy.fen());
        const elapsedTime=recieveTimeStamp ? (Date.now()-recieveTimeStamp) / 1000 : -1;
        const response = await DefaultService.moveApiMovePost({
          state: currentGameState,
          from_square: move.from,
          to_square: move.to,
          elapsed_time: elapsedTime,
          piece: move.promotion || undefined
        });

        const newGameCopy = new Chess(currentGameState.fen);

        if (response.state.mode === 'show') {
          let move = newGameCopy.move(response.correct_move);
          setShowSquares([move.from, move.to]);
          newGameCopy.undo();
        } else {
          setShowSquares([]);
        }

        setGameState(response.state);
        setPosition(response.state.fen);
        setRecieveTimeStamp(Date.now())
        setExplanation(response.message);
        setInfoAnimationKey(prev => prev + 1);

        // Clear any square highlights
        setSquareStyles({
          moveSquares: {},
          optionSquares: {},
          rightClickedSquares: {}
        });
      }
    } catch (error) {
      console.error("Error making move:", error);
      if (error.response && error.response.status === 401) {
        logout();
      }
    }
  }, [recieveTimeStamp, setGameState, setPosition, logout]);

  const onDrop = useCallback((sourceSquare, targetSquare) => {
    makeMove({
      from: sourceSquare,
      to: targetSquare,
      promotion: "q"
    });
    return true;
  }, [makeMove]);

  const onSquareClick = useCallback((square) => {
    // If we already have a piece selected
    if (Object.keys(squareStyles.moveSquares).length > 0) {
      const move = {
        from: Object.keys(squareStyles.moveSquares)[0],
        to: square,
        promotion: "q"
      };

      // Clear the selected square
      setSquareStyles(prev => ({
        ...prev,
        moveSquares: {},
        optionSquares: {}
      }));

      // Make the move
      makeMove(move);
      return;
    }

    // Otherwise, select the piece and show possible moves
    const currentPosition = useGameStore.getState().position;
    if (!currentPosition) return;
    const game = new Chess(currentPosition);
    const piece = game.get(square);
    if (piece && piece.color === (game.turn() === 'w' ? 'w' : 'b')) {
      // Highlight the selected square
      const moveSquares = {
        [square]: {
          background: "rgba(100, 100, 255, 0.3)"
        }
      };

      // Show possible moves
      const moves = game.moves({ square, verbose: true });
      const optionSquares = {};
      moves.forEach(move => {
        optionSquares[move.to] = {
          background: "rgba(0, 128, 0, 0.2)",
          borderRadius: "50%",
          boxShadow: "inset 0 0 0 8px rgba(0, 128, 0, 0.1)"
        };
      });

      setSquareStyles(prev => ({
        ...prev,
        moveSquares,
        optionSquares
      }));
    }
  }, [makeMove, squareStyles.moveSquares]);

  const onSquareRightClick = useCallback((square) => {
    // Implementation for right-click handling
    // ...
  }, []);

  const handleExploration = useCallback(() => {
    setShowExploration(true);
  }, []);

  const handleExplorationExit = useCallback(() => {
    setShowExploration(false);
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Check if user has no courses or position available
  if (!position && !loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', p: 4 }}>
        <Box sx={{ textAlign: 'center' }}>
          <h2>No courses available</h2>
          <p>Please contact an administrator to set up courses for your account.</p>
        </Box>
      </Box>
    );
  }

  console.log('loading')
  console.log('gameState', gameState);
  console.log('position', position);

  // Show exploration mode if requested
  if (showExploration && position) {
    return (
      <ApiExploration
        fen={position}
        token={token}
        onExit={handleExplorationExit}
        boardOrientation={getOrientation(gameState?.fen)}
      />
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: screenOrientation, height: '100%' }}>
      <Box sx={{
        width: boardWidth,
        height: boardWidth,
        margin: 'auto'
      }}>
        <Chessboard
          position={position}
          onPieceDrop={onDrop}
          onSquareClick={onSquareClick}
          onSquareRightClick={onSquareRightClick}
          boardOrientation={getOrientation(gameState?.fen)}
          customArrows={showSquares.length ? [showSquares] : []}
          customSquareStyles={{
            ...squareStyles.moveSquares,
            ...squareStyles.optionSquares,
            ...squareStyles.rightClickedSquares
          }}
        /> : <div>Loading...</div>
      </Box>

      <Box sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        p: 2,
        minWidth: 300
      }}>
        <Info
          link={explanation}
          mode={gameState?.mode || 'play'}
          animationKey={infoAnimationKey}
          onExplanation={handleExploration}
          width="100%"
        />
      </Box>
    </Box>
  );
}
