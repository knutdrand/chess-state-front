import { useState } from "react";
import {Chess} from "chess.js";
import { Chessboard } from "react-chessboard";
import axios from "axios";
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import {jwtDecode} from "jwt-decode";
import Login from './components/Login';
import useToken from './useToken';

function GameScreen(token, clearToken) {
    let jwtPayload = jwtDecode(token.token);
    const playerName = jwtPayload.sub;
    const [game, setGame] = useState(new Chess());
    const [stateColor, setStateColor] = useState('black');
    const [orientation, setOrientation] = useState('white'); // ['white', 'black'
    const [mode, setMode] = useState('play'); // ['play', 'show', 'repeat'];
    const [selectedSquare, setSelectedSquare] = useState(null); // [null, 'a2'
    const [whiteScore, setWhiteScore] = useState(0);
    const [blackScore, setBlackScore] = useState(0);
    const [feedback, setFeedback] = useState(''); // ['play', 'show', 'repeat'
    const [startTime, setStartTime] = useState(0);

    function getResponse(fen, sourceSquare, targetSquare, piece) {

        const externalUrl = 'https://chess-state.vercel.app';
        const elapsedTime = startTime > 0 ? (new Date().getTime() - startTime) / 1000 : -1;
        const internalUrl = 'http:///0.0.0.0:8000';
        const baseUrl = false ? externalUrl : internalUrl;
        const urlifiedFen = fen.replace(/ /g, "_").replace(/\//g, '+');
        const url = baseUrl + '/move/' + mode + '/' + urlifiedFen + '/' + sourceSquare + '/' + targetSquare + '/' + piece + '/' + elapsedTime;
        //const requestStartTime = new Date().getTime();
        const updateUrl = baseUrl + '/update_player/' + playerName
        let authorization = `Bearer ${token.token}`;
        //console.log('Request time: ' + (new Date().getTime() - requestStartTime) + ' ms')
        // Catch 401 error


        axios.post(url, {}, {
  headers: {
    'accept': 'application/json',
    'Authorization': authorization
  }
}
        ).then(
            (response) => {
                const game = new Chess(response.data.board);
                setOrientation(game.turn() === 'w' ? 'white' : 'black'); // set orientation to the current turn
                setGame(game);
                setMode(response.data.mode);
                setFeedback(response.data.mode === 'show' ? response.data.correct_move : '');
                setWhiteScore(response.data.white_score);
                setBlackScore(response.data.black_score);
                if (response.data.mode === 'show') setStateColor('red');
                else if (response.data.mode === 'repeat') setStateColor('orange');
                else setStateColor('green');
                setStartTime(new Date().getTime());
                axios.post(updateUrl)
            }
        ).catch((error) => {
            if (error.response.status === 401) {
                clearToken();
            }
        });
        return true;

    }

    async function onDrop(sourceSquare, targetSquare, piece) {
        const fen = game.fen();
        try {
            const r = game.move({from: sourceSquare, to: targetSquare, promotion: 'q'});
            if (!r) return false;
        } catch (e) {
            return false;
        }

        setGame(new Chess(game.fen()));
        return getResponse(fen, sourceSquare, targetSquare, piece)
        //return setTimeout(() => getResponse(fen, sourceSquare, targetSquare), 200);
    }

    async function handleSquareClick(square) {
        if (selectedSquare) {
            onDrop(selectedSquare, square)
            setSelectedSquare(null);
        } else {
            setSelectedSquare(square);
        }
        return true
    }

    return (
        <div className="ChessState">
            <Chessboard
                position={game.fen()}
                onPieceDrop={onDrop}
                onSquareClick={handleSquareClick}
                boardOrientation={orientation}
                boardWidth={Math.min(window.innerWidth, window.innerHeight * 0.9)}
                customSquareStyles={selectedSquare ? {[selectedSquare]: {backgroundColor: 'rgba(255, 255, 0, 0.4)'}} : {}}
            />
            <div Status style={{color: stateColor}}>
                {mode}: {feedback}, sW: {whiteScore.toFixed(2)}, sB: {blackScore.toFixed(2)}<br/>
                FEN: {game.fen()}<br/>
            </div>
        </div>);
}

const  UserNameToGameScreen = () => {
    //let user write in name and start a GameScreen on submit
    const { token, setToken } = useToken();
    let clearToken = () => {
        setToken(null);
    }
    if (token) {
        return <GameScreen token={token} clearToken={clearToken}/>;
    }
    return (
        <div>
            <Login setToken={setToken} />
        </div>
    )
    // (
    //     <div>
    //     <h1>Enter your name to start playing</h1>
    //         <input type="text" id="playerName" name="playerName" />
    //         <button onClick={() => {window.location.href = '/' + document.getElementById('playerName').value}}>Submit</button>
    //     </div>
    //
    // )

}

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Route for the chess app with player name as a URL parameter */}
          <Route path='/' element={<UserNameToGameScreen />} />
      </Routes>
    </Router>
  );
};

export default App