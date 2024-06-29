import {jwtDecode} from "jwt-decode";
import {useState} from "react";
import {Chess} from "chess.js";
import {apiUrl} from "../config";
import axios from "axios";
import {Chessboard} from "react-chessboard";
import Alert from 'react-bootstrap/Alert';
import "bootstrap/dist/css/bootstrap.min.css";

export function GameScreen({token, setToken}) {
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
    const [showSquare, setShowSquare] = useState([]);
    const [link, setLink] = useState(null);

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
                if (response.data.mode === 'show') {
                    let mvoe = game.move(response.data.correct_move);
                    setShowSquare([mvoe.from, mvoe.to]);
                    game.undo();
                } else {
                    setShowSquare([]);
                }
                setFeedback(response.data.mode === 'show' ? response.data.correct_move: '');
                setLink(response.data.message);
                setWhiteScore(response.data.white_score);
                setBlackScore(response.data.black_score);
                setStartTime(new Date().getTime());
                setToken(token)
                axios.post(updateUrl)
            }
        ).catch((error) => {
            //Catch authentication error
            if (error.response.status === 401) {
                console.log('Authentication error');
                setToken(null);
            }
            else {
                console.log('Error: ' + error);
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

    function getCustomSquareStyles() {
        if (mode === 'show') {
            let styles =  {[showSquare[0]]: {backgroundColor: 'rgba(255, 0, 255, 0.4)'}, [showSquare[1]]: {backgroundColor: 'rgba(255, 0, 255, 0.4)'}};
            if (selectedSquare) {
                styles[selectedSquare] = {backgroundColor: 'rgba(255, 255, 0, 0.4)'};
            }
            return styles;
        } else {
            return selectedSquare ? {[selectedSquare]: {backgroundColor: 'rgba(255, 255, 0, 0.4)'}} : {};
        }
    }

    let boardWidth = Math.min(window.innerWidth, window.innerHeight * 0.9);
    return (
        <div className="ChessState">
            <Chessboard
                position={game.fen()}
                onPieceDrop={onDrop}
                onSquareClick={handleSquareClick}
                boardOrientation={orientation}
                boardWidth={boardWidth}
                customSquareStyles={getCustomSquareStyles()}
            />
            {mode === 'play' ? <PlayerStatus score={whiteScore + blackScore} width={boardWidth}/> : <Info mode={mode} feedback={feedback} width={boardWidth} link={link}/>}

        </div>);
}
function PlayerStatus({score, width}) {
    const roundedDownScore = Math.floor(score);

    const progress = (score - roundedDownScore);
    let style = {width: width};
    return (
        <div style={style}>
            <Alert variant='success' >Level: {roundedDownScore} <progress value={progress} max={1}/> </Alert>
        </div>)
}

function Info({mode, feedback, width, link}) {
    const text = mode === 'show' ? 'Incorrect: ' + feedback  : 'Repeat the move';
    const variant = mode === 'show' ? 'danger' : 'warning';
    let style = {width: width};
    return (
        <div style={style}>
        <Alert  variant={variant} key={variant}> {text} {link && <Alert.Link href={link} target="_blank" rel="noopener noreferrer">View in Chessable</Alert.Link>}</Alert>
        </div>
    )
}
        //<div style={{color: stateColor}}>{mode}: {feedback}</div>
