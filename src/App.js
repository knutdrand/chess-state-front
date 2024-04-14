import { useState } from "react";
import {Chess} from "chess.js";
import { Chessboard } from "react-chessboard";
import axios from "axios";
import { BrowserRouter as Router, Route, Routes, useParams } from 'react-router-dom';

function ChessApp() {
    let { playerName } = useParams();
  const [game, setGame] = useState(new Chess());
  const [stateColor, setStateColor] = useState('black');
  const [orientation, setOrientation] = useState('white'); // ['white', 'black'
  const [mode, setMode] = useState('play'); // ['play', 'show', 'repeat'];
    const [selectedSquare, setSelectedSquare] = useState(null); // [null, 'a2'
    const [whiteScore, setWhiteScore] = useState(0);
    const [blackScore, setBlackScore] = useState(0);
    const [feedback, setFeedback] = useState(''); // ['play', 'show', 'repeat'
    function getResponse(fen, sourceSquare, targetSquare) {
        const baseUrl = 'https://chess-state.vercel.app';
        //const baseUrl = 'http:///0.0.0.0:8000';
        const urlifiedFen = fen.replace(/ /g, "_").replace(/\//g, '+');
        const url = baseUrl + '/move/' + playerName + '/' + mode + '/' + urlifiedFen + '/' + sourceSquare + '/' + targetSquare + '/';
        axios.post(url).then(
            (response) => {
            console.log(response.data);
            const game = new Chess(response.data.board);
            setOrientation(game.turn() === 'w' ? 'white' : 'black'); // set orientation to the current turn
            setGame(game);
            setMode(response.data.mode);
            setFeedback(response.data.mode==='show' ? response.data.correct_move : '');
            setWhiteScore(response.data.white_score);
            setBlackScore(response.data.black_score);
            if (response.data.mode === 'show') setStateColor('red');
            else if (response.data.mode === 'repeat') setStateColor('yellow');
            else setStateColor('green');
        }
    );
    return true;

    }

  async function onDrop(sourceSquare, targetSquare) {
        const fen = game.fen();
      try {
          const r  = game.move({from: sourceSquare, to: targetSquare});
          if (!r) return false;
      }
        catch (e) {
          return false;
        }

    setGame(new Chess(game.fen()));
      return getResponse(fen, sourceSquare, targetSquare)
    //return setTimeout(() => getResponse(fen, sourceSquare, targetSquare), 200);
  }

  async function handleSquareClick(square) {
        if (selectedSquare) {
            onDrop(selectedSquare, square)
            setSelectedSquare(null);
            //try{
            //    game.move({from: selectedSquare, to: square});
            //}
            //catch (e) {
            //    setSelectedSquare(null);
            //    return false;
            //}
            //setGame(new Chess(game.fen()));
            //getResponse(game.fen(), selectedSquare, square);
            //setSelectedSquare(null);
            }
        else {
            setSelectedSquare(square);
        }
        return true
        }

  return (
      <div className="ChessState" style={{
        maxWidth: 300,
        maxHeight: 300,
        flexGrow: 1}}>
          <Chessboard
              position={game.fen()}
              onPieceDrop={onDrop}
              onSquareClick={handleSquareClick}
              boardOrientation={orientation}
              customSquareStyles={selectedSquare ? { [selectedSquare]: { backgroundColor: 'rgba(255, 255, 0, 0.4)' } } : {}}
          />
          <div Status style={{color: stateColor}} >{mode}: {feedback}, sW: {whiteScore.toFixed(2)}, sB: {blackScore.toFixed(2)}</div>

      </div>);
}

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Route for the chess app with player name as a URL parameter */}
        <Route path="/:playerName" element={<ChessApp />} />
      </Routes>
    </Router>
  );
};

export default App