import React, {useEffect, useState} from "react";
import {jwtDecode} from "jwt-decode";
import {debounce} from "lodash";
import {PlayerStatus} from "./PlayerStatus";
import {Info} from "./Info";
import {GameScreen} from "./GameScreen";
import Config from "./Config";
import {Navigation} from "./Navigation";
import Exploration2 from "./Exploration2";
import Courses from './Courses'; // New component for course management
import { Container, Button } from 'react-bootstrap';
import {apiUrl} from "../config";
import { Height } from "@mui/icons-material";


export function MainScreen({ token, setToken}) {
  const [mode, setMode] = useState('play');
  const [game, setGame] = useState(null);
  const [boardWidth, setBoardWidth] = useState(400);
  const [activeTab, setActiveTab] = useState('play'); // Track active tab
  const decodedToken = jwtDecode(token);



  useEffect(() => {
    const updateBoardWidth = debounce(() => {
      const navHeight = 56;
      const maxBoardHeight = window.innerHeight - navHeight - 120;
      const maxBoardWidth = window.innerWidth - 20;
      setBoardWidth(Math.min(maxBoardHeight, maxBoardWidth));
    }, 100);

    updateBoardWidth();
    window.addEventListener('resize', updateBoardWidth);
    return () => window.removeEventListener('resize', updateBoardWidth);
  }, []);



  const handleLogout = () => {
    setToken(null);
  };
  return (
    <Container
      fluid
      className="d-flex flex-column align-items-center p-3 vh-100 bg-body-tertiary"
    >
      <Navigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        userName={decodedToken.sub}
        handleLogout={handleLogout}
      />
      <div className="flex-grow-1 d-flex flex-column align-items-center justify-content-center w-100">
        {activeTab === 'play' && (
          <GameScreen
            game={game}
            setGame={setGame}
            token={token}
            setToken={setToken}
            boardWidth={boardWidth}
            mode={mode}
            setMode={setMode}
          />
        )}
        {activeTab === 'courses' && <Courses apiUrl={apiUrl} token={token} />}
        {activeTab === 'settings' && <Config token={token} />}
      </div>
    </Container>
  );

}
