import { useState } from "react";
import {Chess} from "chess.js";
import { Chessboard } from "react-chessboard";
import axios from "axios";

export default function PlayRandomMoveEngine() {
  const [game, setGame] = useState(new Chess());
  const [orientation, setOrientation] = useState('white'); // ['white', 'black'
  const [mode, setMode] = useState('play'); // ['play', 'show', 'repeat'];
    const [whiteScore, setWhiteScore] = useState(0);
    const [blackScore, setBlackScore] = useState(0);
    const [playerName, setPlayerName] = useState('kuppern87'); // Declare a state variable...
    const [feedback, setFeedback] = useState(''); // ['play', 'show', 'repeat'
    function getResponse(fen, sourceSquare, targetSquare) {
    const urlifiedFen = fen.replace(/ /g, "_").replace(/\//g, '+');
    const username = playerName;
    const url = 'api/' + username+ '/' + mode + '/' + urlifiedFen + '/' + sourceSquare + '/' + targetSquare + '/';
    // const url = 'http:///0.0.0.0:8000/move/' + username+ '/' + mode + '/' + urlifiedFen + '/' + sourceSquare + '/' + targetSquare + '/';

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
        }
    );
    return true;

    }

  async function onDrop(sourceSquare, targetSquare) {
    const fen = game.fen();
    // see if the move is legal
      try {
          game.move({from: sourceSquare, to: targetSquare});
      }
        catch (e) {
          return false;
        }
    //game.move({from: sourceSquare, to: targetSquare});
    setGame(new Chess(game.fen()));
    return setTimeout(() => getResponse(fen, sourceSquare, targetSquare), 200);
  }

  return (
      <div className="ChessState">
          <Chessboard position={game.fen()} onPieceDrop={onDrop} boardWidth={300} boardOrientation={orientation}/>
          <div Status>{mode}: {feedback}, sW: {whiteScore.toFixed(2)}, sB: {blackScore.toFixed(2)}</div>
          <input
              value={playerName} // ...force the input's value to match the state variable...
              onChange={e => setPlayerName(e.target.value)} // ... and update the state variable on any edits!
          />
      </div>);
}
