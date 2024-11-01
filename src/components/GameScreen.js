import React, {useEffect, useRef, useState} from "react";
import {Alert, Button, Container, Image, Nav, Navbar, ProgressBar} from 'react-bootstrap';
import {Chess} from 'chess.js';
import {apiUrl} from '../config';
import {Chessboard} from 'react-chessboard';
import "bootstrap/dist/css/bootstrap.min.css";
import axios from 'axios';
import {jwtDecode} from 'jwt-decode';
import {debounce} from 'lodash';
import {Info} from "./Info";


export function MainScreen({ token, setToken, apiUrl }) {
  const [mode, setMode] = useState('play');
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [link, setLink] = useState(null);
  const [boardWidth, setBoardWidth] = useState(400);
  const decodedToken = jwtDecode(token);

  useEffect(() => {
    const updateBoardWidth = debounce(() => {
      const navHeight = 56; // Approximate height of the Navbar
      const maxBoardHeight = window.innerHeight - navHeight - 120;
      const maxBoardWidth = window.innerWidth - 20;
      setBoardWidth(Math.min(maxBoardHeight, maxBoardWidth));
    }, 100);

    updateBoardWidth();
    window.addEventListener('resize', updateBoardWidth);
    return () => window.removeEventListener('resize', updateBoardWidth);
  }, []);

  useEffect(() => {
    //axios.post(`${apiUrl}/update_player/${decodedToken.sub}`);
  }, [token, apiUrl]);

  const handleLogout = () => {
    setToken(null);
  };

  const inputRef = useRef(null);

  const handleUploadClick = () => {
    inputRef.current.click();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      console.log('File selected:', file);

      const formData = new FormData();
      formData.append('file', file);

      try {
        const response = await axios.post(`${apiUrl}/add-course/`, formData, {
          headers: {
            'accept': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
        console.log('File uploaded successfully:', response.data);
      } catch (error) {
        console.error('Error uploading file:', error);
        setFeedback('File upload failed. Please try again.');
      }
    }
  };

  return (
    <Container fluid className="d-flex flex-column align-items-center p-3 vh-100 bg-body-tertiary">
      <Navbar className="mb-3 w-100 justify-content-between">
        <Navbar.Brand>
          <Image src="/logo192.png" alt="Chess-State Logo" width={32} height={32} className="mr-2" />
          Chess State
        </Navbar.Brand>
        <Navbar.Text>{decodedToken.sub}</Navbar.Text>
        <Nav className="ml-auto">
          <input
            style={{ display: 'none' }}
            ref={inputRef}
            type="file"
            accept=".pgn"
            onChange={handleFileChange}
          />
          <Button onClick={handleUploadClick}>Add Course</Button>
          <Button onClick={handleLogout}>Logout</Button>
        </Nav>
      </Navbar>
      <div className="flex-grow-1 d-flex flex-column align-items-center justify-content-center">
        <GameScreen
          token={token}
          setToken={setToken}
          setScore={setScore}
          setFeedback={setFeedback}
          setLink={setLink}
          setMode={setMode}
          boardWidth={boardWidth}
          mode={mode}
        />
        {mode === 'play' ? (
          <PlayerStatus score={score} width={boardWidth} />
        ) : (
          <Info mode={mode} feedback={feedback} width={boardWidth} link={link} />
        )}
      </div>
    </Container>
  );
}

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


function PlayerStatus({ score, width }) {
  const roundedDownScore = Math.floor(score);
  const progress = (score - roundedDownScore) * 100;

  return (
    <Alert variant='success' style={{ width: width }} className="text-center">
      <ProgressBar
        now={progress}
        label={`Level: ${roundedDownScore}`}
        className="mt-2"
        variant="info"
      />
    </Alert>
  );
}

