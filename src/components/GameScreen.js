import React, { useState, useEffect, useCallback } from "react";
import { Chess } from 'chess.js';
import { Chessboard } from "react-chessboard";
import { Box, CircularProgress } from "@mui/material";
import { DefaultService, OpenAPI } from "../api";
import { Info } from "./Info";
import { baseUrl } from '../config';

export function GameScreen({ game, setGame, token, setToken, boardWidth, screenOrientation, mode, setMode }) {
  // Board state
  const [position, setPosition] = useState("start");
  const [orientation, setOrientation] = useState('white');
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [explanation, setExplanation] = useState(null);
  const [playerStatus, setPlayerStatus] = useState(null);
  const [infoAnimationKey, setInfoAnimationKey] = useState(0);
  
  // Square highlighting state
  const [squareStyles, setSquareStyles] = useState({
    moveSquares: {},
    optionSquares: {},
    rightClickedSquares: {}
  });
  const [showSquares, setShowSquares] = useState([]);

  // Configure the API with the token
  useEffect(() => {
    OpenAPI.BASE = baseUrl;
    OpenAPI.TOKEN = token;
    OpenAPI.HEADERS = {
      'Authorization': `Bearer ${token}`
    };
  }, [token]);

  // Initialize game if not already initialized
  useEffect(() => {
    if (!game) {
      initGame();
    }
  }, []);

  // Update board when game changes
  useEffect(() => {
    if (game && position !== game.fen()) {
      setPosition(game.fen());
      setOrientation(game.turn() === 'w' ? 'white' : 'black');
    }
  }, [game, position]);

  const initGame = async () => {
    setLoading(true);
    try {
      const response = await DefaultService.initApiInitGet();
      const chess = new Chess(response.board);
      setGame(chess);
      setPosition(response.board);
      setOrientation(chess.turn() === 'w' ? 'white' : 'black');
      setMode('play');
    } catch (error) {
      console.error("Error initializing game:", error);
      if (error.response && error.response.status === 401) {
        setToken(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const makeMove = useCallback(async (move) => {
    if (!game) return;
    
    try {
      const gameCopy = new Chess(game.fen());
      const result = gameCopy.move(move);
      const oldFen = position;
      
      if (result) {
        setGame(gameCopy);
        setPosition(gameCopy.fen());
        
        const response = await DefaultService.moveApiMovePost({
          fen: oldFen,
          from_square: move.from,
          to_square: move.to,
          mode: mode,
          elapsed_time: -1,
          piece: move.promotion || undefined
        });
        
        const newGameCopy = new Chess(response.board);
        
        if (response.mode === 'show') {
          let move = newGameCopy.move(response.correct_move);
          setShowSquares([move.from, move.to]);
          newGameCopy.undo();
        } else {
          setShowSquares([]);
        }
        
        setOrientation(newGameCopy.turn() === 'w' ? 'white' : 'black');
        setGame(newGameCopy);
        setPosition(newGameCopy.fen());
        setMode(response.mode);
        setExplanation(response.message);
        setPlayerStatus(response.mode);
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
        setToken(null);
      }
    }
  }, [game, position, mode, setGame, setToken]);

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
    if (!game) return;
    
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
  }, [game, makeMove, squareStyles.moveSquares]);

  const onSquareRightClick = useCallback((square) => {
    // Implementation for right-click handling
    // ...
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress />
      </Box>
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
          boardOrientation={orientation}
          customArrows={showSquares.length ? [showSquares] : []}
          customSquareStyles={{
            ...squareStyles.moveSquares,
            ...squareStyles.optionSquares,
            ...squareStyles.rightClickedSquares
          }}
        />
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
          mode={mode} 
          animationKey={infoAnimationKey} 
        />
      </Box>
    </Box>
  );
}
