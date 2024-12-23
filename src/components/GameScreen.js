import React, {useEffect, useState} from "react";
import {Chess} from 'chess.js';
import {PlayerStatus} from './PlayerStatus';
import {Info} from './Info';
import {apiUrl} from '../config';
import {Chessboard} from 'react-chessboard';
import "bootstrap/dist/css/bootstrap.min.css";
import axios from 'axios';
import {jwtDecode} from 'jwt-decode';
import Exploration2, { ApiExploration, ExampleExploration } from "./Exploration2";


export function GameScreen({ token, setToken, setMode, boardWidth, mode, game, setGame }) {
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
  async function onSolution(event) {
    const fen = game.fen();
    const elapsedTime = startTime > 0 ? (new Date().getTime() - startTime) / 1000 : -1;
    const urlifiedFen = fen.replace(/ /g, "_").replace(/\//g, '+');
    const url = `${apiUrl}/show`;
    let authorization = `Bearer ${token}`;

    try {
      const response = await axios.post(url,
         { fen: urlifiedFen,
            elapsed_time: elapsedTime,
            line: line,
           },
          {
        headers: {
          'accept': 'application/json',
          'Authorization': authorization
        }});
      handleResponse(response);
    } catch (error) {
      if (error?.response?.status === 401) {
        console.log('Authentication error');
        setToken(null);
      } else {
        setFeedback('Server error');
      }
    }
  }

  useEffect(() => {
    if (!token) return;
    console.log('initing game, current game', game);
    if (game) return;
    const url = `${apiUrl}/init`;
    const headers = { 'accept': 'application/json', 'Authorization': `Bearer ${token}` };
    axios.get(url, { headers })
        .then(response => {
          let chess = new Chess(response.data.board);
          console.log('response', response.data);
          if (response.data.success === false) {
            setPlayStatus('No course available');
            return;
          }
          setGame(chess);
          setLine(response.data.line);
          setOrientation(chess.turn() === 'w' ? 'white' : 'black');
          setMode('play');
        }).catch(error => {
          setFeedback('Server error: ' + error);
          console.log({error});
    });
    }, [token]);


  async function getResponse(fen, sourceSquare, targetSquare, piece) {
    const elapsedTime = startTime > 0 ? (new Date().getTime() - startTime) / 1000 : -1;
    const urlifiedFen = fen.replace(/ /g, "_").replace(/\//g, '+');
    const url = `${apiUrl}/move`;
    let authorization = `Bearer ${token}`;

    try {
      const response = await axios.post(url,
         { fen: urlifiedFen,
           from_square:  sourceSquare,
            to_square: targetSquare,
            mode: mode,
            elapsed_time: elapsedTime,
            line: line,
           },
          {
        headers: {
          'accept': 'application/json',
          'Authorization': authorization
        }
      });
      handleResponse(response);
    } catch (error) {
      if (error?.response?.status === 401) {
        console.log('Authentication error');
        setToken(null);
      } else {
        setFeedback('Server error');
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
      let styles = {
        [showSquare[0]]: { backgroundColor: 'rgba(255, 0, 255, 0.4)' },
        [showSquare[1]]: { backgroundColor: 'rgba(255, 0, 255, 0.4)' }
      };
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
  return (
    <div className="ChessState mb-3">
      {isExploring ? (
        <ApiExploration fen={game.fen()} token={token} onExit={()=>setIsExploring(false)}/>
      ) : (
        <>
          <Chessboard
            position={game.fen()}
            onPieceDrop={onDrop}
            onSquareClick={handleSquareClick}
            boardOrientation={orientation}
            boardWidth={boardWidth}
            customSquareStyles={getCustomSquareStyles()}
          />
          {mode === 'play' ? (
            <div style={{ width: boardWidth }}>
              <PlayerStatus
                score={score}
                width={boardWidth - 20}
                onSolution={onSolution}
              />
            </div>
          ) : (
            <div style={{ width: boardWidth }}>
              <Info
                mode={mode}
                feedback={feedback}
                width={boardWidth}
                link={link}
                onExplanation={() => setIsExploring(true)}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}


