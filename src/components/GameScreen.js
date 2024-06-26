import {jwtDecode} from "jwt-decode";
import {useState} from "react";
import {Chess} from "chess.js";
import {apiUrl} from "../config";
import axios from "axios";
import {Chessboard} from "react-chessboard";

export function GameScreen(token_obj) {
    const token = token_obj.token_obj;
    console.log('token:' + token)
    let jwtPayload = jwtDecode(token);
    const playerName = jwtPayload.sub;
    const [game, setGame] = useState(new Chess());
    const [orientation, setOrientation] = useState('white'); // ['white', 'black'
    const [mode, setMode] = useState('play'); // ['play', 'show', 'repeat'];
    const [selectedSquare, setSelectedSquare] = useState(null); // [null, 'a2'
    const [whiteScore, setWhiteScore] = useState(0);
    const [blackScore, setBlackScore] = useState(0);
    const [feedback, setFeedback] = useState(''); // ['play', 'show', 'repeat'
    const [startTime, setStartTime] = useState(0);

    function getResponse(fen, sourceSquare, targetSquare, piece) {
        const elapsedTime = startTime > 0 ? (new Date().getTime() - startTime) / 1000 : -1;
        const urlifiedFen = fen.replace(/ /g, "_").replace(/\//g, '+');
        const url = apiUrl + '/move/' + mode + '/' + urlifiedFen + '/' + sourceSquare + '/' + targetSquare + '/' + piece + '/' + elapsedTime;
        const updateUrl = apiUrl + '/update_player/' + playerName
        let authorization = `Bearer ${token}`;
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
                setStartTime(new Date().getTime());
                axios.post(updateUrl)
            }
        );
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
            <Info mode={mode} feedback={feedback} whiteScore={whiteScore} blackScore={blackScore}/>
        </div>);
}
function Info({mode, feedback, whiteScore, blackScore}){
    let stateColor = 'green';
    if (mode === 'show') stateColor = 'red'
    else if (mode === 'repeat') stateColor = 'orange';
    return (
        <div style={{color: stateColor}}>
            {mode}: {feedback}, sW: {whiteScore.toFixed(2)}, sB: {blackScore.toFixed(2)}<br/>
        </div>
    )
}