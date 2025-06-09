import React, {useEffect, useState} from "react";
import {jwtDecode} from "jwt-decode";
import {debounce} from "lodash";
import {PlayerStatus} from "./PlayerStatus";
import {Info} from "./Info";
import {GameScreen} from "./GameScreen";
import Config from "./Config";
import {Navigation} from "./Navigation";
import Exploration2 from "./Exploration2";
import Courses from './Courses';
import { Box, Container, Button, AppBar, Toolbar, Typography } from "@mui/material";
import './MainScreen.css';


const navHeight = 56;
const minInfoWidth = 300;
const minInfoHeight = 128;
const margin = 2;

export function MainScreen({ token, setToken}) {
  const [mode, setMode] = useState('play');
  const [game, setGame] = useState(null);
  const [boardWidth, setBoardWidth] = useState(400);
  const [activeTab, setActiveTab] = useState('play'); // Track active tab
  const [screenOrientation, setScreenOrientation] = useState('column'); // Track screen orientation
  const decodedToken = jwtDecode(token);

  useEffect(() => {
    const updateBoardWidth = debounce(() => {
      const maxBoardHeight = window.innerHeight - navHeight - minInfoHeight - 3*margin*8;
      const maxBoardWidth = window.innerWidth-2*margin*8;
      const newBoardWidth = Math.min(maxBoardHeight, maxBoardWidth);
      setBoardWidth(newBoardWidth);
      setScreenOrientation('column');
    });
    updateBoardWidth();
    window.addEventListener('resize', updateBoardWidth);
    return () => window.removeEventListener('resize', updateBoardWidth);
  }, []);



  const handleLogout = () => {
    setToken(null);
  };
  return (
    //<div className='main-screen'>
    <Box sx={{display: 'flex', flexDirection: 'column', height: '100vh'}}>
      <Box sx={{height: navHeight}}>
      <Navigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        userName={decodedToken.sub}
        handleLogout={handleLogout}
      />
      </Box>
      <Box sx={{flex: 1, marginTop: margin}}>

        {activeTab === 'play' && (
          <GameScreen
            game={game}
            setGame={setGame}
            token={token}
            setToken={setToken}
            boardWidth={boardWidth}
            screenOrientation={screenOrientation}
            mode={mode}
            setMode={setMode}
          />
        )}
        {activeTab === 'courses' && <Courses token={token} />}
        {activeTab === 'settings' && <Config token={token} />}
      </Box>
    </Box>
  );
}
