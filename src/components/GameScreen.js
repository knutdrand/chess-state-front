import {jwtDecode} from "jwt-decode";
import { useState } from 'react';
import { Chess } from 'chess.js';
import { apiUrl } from '../config';
import axios from 'axios';
import { Chessboard } from 'react-chessboard';
import Alert from 'react-bootstrap/Alert';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import "bootstrap/dist/css/bootstrap.min.css";
import {Button, Nav, Navbar, ProgressBar} from "react-bootstrap";

export function MainScreen({ token, setToken }) {
  const [mode, setMode] = useState('play');
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [link, setLink] = useState(null);
  const boardWidth = Math.min(window.innerWidth*0.9, window.innerHeight * 0.8);

  const handleLogout = () => {
    setToken(null);
  };

  return (
    <Container fluid className="p-3">
      <Navbar bg="dark" variant="dark" className="mb-3">
        <Navbar.Brand>Chess-State</Navbar.Brand>
        <Nav className="ml-auto">
          <Button variant="outline-light" onClick={handleLogout}>Logout</Button>
        </Nav>
      </Navbar>
      <Row className="justify-content-center">
        <Col xs={12} md={8} lg={6}>
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
          {mode === 'play' ?
            <PlayerStatus score={score} width={boardWidth} /> :
            <Info mode={mode} feedback={feedback} width={boardWidth} link={link} />
          }
        </Col>
      </Row>
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

      setFeedback(response.data.mode === 'show' ? response.data.correct_move : '');
      setLink(response.data.message);
      setScore(response.data.white_score + response.data.black_score);
      setStartTime(new Date().getTime());
      setToken(token);
      await axios.post(updateUrl);
    } catch (error) {
      console.log('Error: ', error);
      if (error.response.status === 401) {
        console.log('Authentication error');
        setToken(null);
      }
    }
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

function Info({ mode, feedback, width, link }) {
  const text = mode === 'show' ? `Incorrect: ${feedback}` : 'Repeat the move';
  const variant = mode === 'show' ? 'danger' : 'warning';
  return (
    <Alert variant={variant} style={{ width: width }}>
      {text}
      {link && <Alert.Link href={link} target="_blank" rel="noopener noreferrer">View in Chessable</Alert.Link>}
    </Alert>
  );
}
