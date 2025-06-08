import React, {useEffect, useState} from "react";
import {Chess} from 'chess.js';
import {PlayerStatus} from './PlayerStatus';
import {Info} from './Info';
import {Chessboard} from 'react-chessboard';
import "bootstrap/dist/css/bootstrap.min.css";
import {jwtDecode} from 'jwt-decode';
import Exploration2, { ApiExploration, ExampleExploration } from "./Exploration2";
import {Box} from '@mui/material';
import { api } from '../api/apiClient';

export function GameScreen({ token, setToken, setMode, boardWidth, mode, game, setGame, screenOrientation }) {
  const [orientation, setOrientation] = useState('white');
  const [playStatus, setPlayStatus] = useState('Loading');
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [startTime, setStartTime] = useState(0);
  const [showSquare, setShowSquare] = useState([]);
  const [line, setLine] = useState({});
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState();
  const [link, setLink] = useState(null);
  const [isExploring, setIsExploring] = useState(false);

  // Set up authentication when token changes
  useEffect(() => {
    if (token) {
      api.setAuthToken(token);
    }
  }, [token]);

  async function onSolution(event) {
    if (!game) return;
    
    const fen = game.fen();
    const elapsedTime = startTime > 0 ? (new Date().getTime() - startTime) / 1000 : -1;
    
    try {
      const response = await api.show(
        fen,
        elapsedTime,
        line
      );
      handleResponse({ data: response });
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('Authentication error');
        setToken(null);
      } else {
        setFeedback('Server error');
        console.error(error);
      }
    }
  }

  useEffect(() => {
    if (!token) return;
    if (game) return;
    
    api.setAuthToken(token);
    
    api.init()
      .then(response => {
        let chess = new Chess(response.board);
        if (response.success === false) {
          setPlayStatus('No course available');
          return;
        }
        setGame(chess);
        setLine(response.line);
        setOrientation(chess.turn() === 'w' ? 'white' : 'black');
        setMode('play');
      })
      .catch(error => {
        setFeedback('Server error: ' + error);
        console.error(error);
      });
  }, [token]);

  async function getResponse(fen, sourceSquare, targetSquare, piece) {
    const elapsedTime = startTime > 0 ? (new Date().getTime() - startTime) / 1000 : -1;
    
    try {
      const moveRequest = {
        fen: fen.replace(/ /g, "_").replace(/\//g, '+'),
        from_square: sourceSquare,
        to_square: targetSquare,
        mode: mode,
        elapsed_time: elapsedTime,
        line: line
      };
      
      const response = await api.move(moveRequest);
      handleResponse({ data: response });
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('Authentication error');
        setToken(null);
      } else {
        setFeedback('Server error');
        console.error(error);
      }
    }
  }

  function handleResponse(response) {
    const updatedGame = new Chess(response.data.board);
    setOrientation(updatedGame.turn() === 'w' ? 'white' : 'black');
    setGame(updatedGame);
    setMode(response.data.mode);
    setLine(response.data.line);

    if (response.data.mode === 'show') {
      let move = updatedGame.move(response.data.correct_move);
      setShowSquare([move.from, move.to]);
      updatedGame.undo();
    } else {
      setShowSquare([]);
    }
    console.log(response.data);
    setFeedback(response.data.mode === 'show' ? response.data.correct_move : '');
    setLink(response.data.message);
    setScore(response.data.white_score + response.data.black_score);
    setStartTime(new Date().getTime());
  }

  async function onDrop(sourceSquare, targetSquare, piece) {
    const fen = game.fen();
    try {
      const result = game.move({ from: sourceSquare, to: targetSquare, promotion: 'q' });
      if (!result) return false;
    } catch (e) {
      return false;
    }

    setGame(new Chess(game.fen()));
    return getResponse(fen, sourceSquare, targetSquare, piece);
  }

  async function handleSquareClick(square) {
    if (selectedSquare) {
      onDrop(selectedSquare, square);
      setSelectedSquare(null);
    } else {
      setSelectedSquare(square);
    }
  }

  function getCustomSquareStyles() {
    if (mode === 'show') {
      let styles = {};
      if (selectedSquare) {
        styles[selectedSquare] = { backgroundColor: 'rgba(255, 255, 0, 0.4)' };
      }
      return styles;
    } else {
      return selectedSquare ? { [selectedSquare]: { backgroundColor: 'rgba(255, 255, 0, 0.4)' } } : {};
    }
  }
  if (!game) {
    return <div>{playStatus}</div>;
  }
  console.log('flexDirection', screenOrientation);
  return (
    <Box>
      {isExploring ? (
        <ApiExploration fen={game.fen()} token={token} onExit={()=>setIsExploring(false)}/>
      ) : (
        //<div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 2}}>
          <Box sx={{ width: boardWidth, height: boardWidth, flex: 0 }}> 
          <Chessboard
            position={game.fen()}
            onPieceDrop={onDrop}
            onSquareClick={handleSquareClick}
            boardOrientation={orientation}
            boardWidth={boardWidth}
            customSquareStyles={getCustomSquareStyles()}
            customArrows={showSquare ? [showSquare] : []}
          />
          </Box>
          <Box style={{flex: 1, my: 0, height: '100%'}}>
          {mode === 'play' ? (
              <PlayerStatus
                score={score}
                width={boardWidth}
                onSolution={onSolution}
              />
          ) : (
              <Info
                mode={mode}
                feedback={feedback}
                width={boardWidth}
                link={link}
                onExplanation={() => setIsExploring(true)}
              />
          )}
          </Box>          
          </Box>
      )}
    </Box>
  );
}


