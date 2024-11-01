import React, {useState} from "react";
import {Chess} from 'chess.js';
import {apiUrl} from '../config';
import {Chessboard} from 'react-chessboard';
import "bootstrap/dist/css/bootstrap.min.css";
import axios from 'axios';
import {jwtDecode} from 'jwt-decode';


export function GameScreen({ token, setToken, setScore, setFeedback, setLink, setMode, boardWidth, mode }) {
  let jwtPayload = jwtDecode(token);
  const playerName = jwtPayload.sub;
  const [game, setGame] = useState(new Chess());
  const [orientation, setOrientation] = useState('white');
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [startTime, setStartTime] = useState(0);
  const [showSquare, setShowSquare] = useState([]);

  async function getResponse(fen, sourceSquare, targetSquare, piece) {
    const elapsedTime = startTime > 0 ? (new Date().getTime() - startTime) / 1000 : -1;
    const urlifiedFen = fen.replace(/ /g, "_").replace(/\//g, '+');
    const url = `${apiUrl}/move/${mode}/${urlifiedFen}/${sourceSquare}/${targetSquare}/${piece}/${elapsedTime}`;
    const updateUrl = `${apiUrl}/update_player/${playerName}`;
    let authorization = `Bearer ${token}`;

    try {
      const response = await axios.post(url, {}, {
        headers: {
          'accept': 'application/json',
          'Authorization': authorization
        }
      });
      const updatedGame = new Chess(response.data.board);
      setOrientation(updatedGame.turn() === 'w' ? 'white' : 'black');
      setGame(updatedGame);
      setMode(response.data.mode);

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
      setToken(token);

    } catch (error) {
      if (error?.response?.status === 401) {
        console.log('Authentication error');
        setToken(null);
      } else {
        setFeedback('Server error');
      }
    }
    axios.post(updateUrl);
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

  return (
    <div className="ChessState mb-3">
      <Chessboard
        position={game.fen()}
        onPieceDrop={onDrop}
        onSquareClick={handleSquareClick}
        boardOrientation={orientation}
        boardWidth={boardWidth}
        customSquareStyles={getCustomSquareStyles()}
      />
    </div>
  );
}


