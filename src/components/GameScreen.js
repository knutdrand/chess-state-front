import React, { useState, useEffect } from "react";
import { Chess } from 'chess.js';
import { Chessboard } from "react-chessboard";
import { Box, Grid, Paper, Typography, Button, CircularProgress, Stack } from "@mui/material";
import { DefaultService, OpenAPI } from "../api";
import { Info } from "./Info";
import { baseUrl } from '../config';

export function GameScreen({ game, setGame, token, setToken, boardWidth, screenOrientation, mode, setMode }) {
  const [position, setPosition] = useState("start");
  const [orientation, setOrientation] = useState('white');
  const [rightClickedSquares, setRightClickedSquares] = useState({});
  const [moveSquares, setMoveSquares] = useState({});
  const [optionSquares, setOptionSquares] = useState({});
  const [loading, setLoading] = useState(false);
  const [explanation, setExplanation] = useState(null);
  const [playerStatus, setPlayerStatus] = useState(null);
  const [showSquares, setShowSquares] = useState([]);
  const [infoAnimationKey, setInfoAnimationKey] = useState(0);
  // Configure the API with the token
  useEffect(() => {
    OpenAPI.BASE = baseUrl;
    OpenAPI.TOKEN = token;
    OpenAPI.HEADERS = {
      'Authorization': `Bearer ${token}`
    };
  }, [token]);

  useEffect(() => {
    if (!game) {
      initGame();
    }
  }, []);

  const initGame = async () => {
    setLoading(true);
    try {
      // Use the correct method from DefaultService
      const response = await DefaultService.initApiInitGet();
      const chess = new Chess(response.board)
      setGame(chess);
      setPosition(response.board);
      setOrientation(chess.turn() === 'w' ? 'white' : 'black');
      setLoading(false);
      setMode('play');
    } catch (error) {
      console.error("Error initializing game:", error);
      // Check if it's an authentication error
      if (error.response && error.response.status === 401) {
        setToken(null); // Clear token to redirect to login
      }
      setLoading(false);
    }
  };

  const makeMove = async (move) => {
    if (!game) return;
    
    try {
      const gameCopy = new Chess(game.fen());
      const result = gameCopy.move(move);
      const oldFen = position;
      if (result) {
        setGame(gameCopy);
        
        setPosition(gameCopy.fen());
        
        // Send move to API using DefaultService
        const response = await DefaultService.moveApiMovePost({
          fen: oldFen,
          from_square: move.from,
          to_square: move.to,
          mode: mode,
          elapsed_time: -1,
          piece: move.promotion || undefined
        });
        
        // Handle opponent's move
        const newGameCopy = new Chess(response.board);
        
        if (response.mode==='show') {
          let move = newGameCopy.move(response.correct_move);
          setShowSquares([move.from, move.to]);
          console.log('show', response.correct_move);
          console.log([move.from, move.to]);
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
      }
    } catch (error) {
      console.error("Error making move:", error);
      // Check if it's an authentication error
      if (error.response && error.response.status === 401) {
        setToken(null); // Clear token to redirect to login
      }
    }
  };

  function onDrop(sourceSquare, targetSquare) {
    const move = {
      from: sourceSquare,
      to: targetSquare,
      promotion: "q" // always promote to queen for simplicity
    };
    
    makeMove(move);
    return true;
  }

  function onSquareClick(square) {
    // If we already have a piece selected
    if (Object.keys(moveSquares).length > 0) {
      const move = {
        from: Object.keys(moveSquares)[0],
        to: square,
        promotion: "q" // always promote to queen for simplicity
      };
      
      // Clear the selected square
      setMoveSquares({});
      setOptionSquares({});
      
      // Make the move
      makeMove(move);
      return;
    }
    
    // Otherwise, select the piece and show possible moves
    const piece = game?.get(square);
    if (piece && piece.color === (game.turn() === 'w' ? 'w' : 'b')) {
      // Highlight the selected square
      setMoveSquares({
        [square]: {
          background: "rgba(100, 100, 255, 0.3)"
        }
      });
      
      // Show possible moves
      const moves = game.moves({ square, verbose: true });
      const newOptionSquares = {};
      moves.forEach(move => {
        newOptionSquares[move.to] = {
          background: "rgba(0, 128, 0, 0.2)",
          borderRadius: "50%",
          boxShadow: "inset 0 0 0 8px rgba(0, 128, 0, 0.1)"
        };
      });
      setOptionSquares(newOptionSquares);
    }
  }

  function onSquareRightClick(square) {
    // Implementation for right-click handling
    // ...
  }

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
          customArrows={showSquares ? [showSquares] : []}
          customSquareStyles={{
            ...moveSquares,
            ...optionSquares,
            ...rightClickedSquares
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
        
        {/* <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={initGame}
            fullWidth
          >
            New Game
          </Button>
          <Button 
            variant="outlined" 
            color="secondary"
            onClick={() => setMode(mode === 'play' ? 'explore' : 'play')}
            fullWidth
          >
            {mode === 'play' ? 'Explore' : 'Play'}
          </Button>
        </Stack> */}
      </Box>
    </Box>
  );
}
