import React, {useEffect} from "react";
import {debounce} from "lodash";
import {GameScreen} from "./GameScreen";
import Config from "./Config";
import {Navigation} from "./Navigation";
import Courses from './Courses';
import { Box } from "@mui/material";
import './MainScreen.css';
import { useUiStore } from '../stores/uiStore';


const navHeight = 56;
const minInfoHeight = 128;
const margin = 2;

export function MainScreen() {
  const activeTab = useUiStore((s) => s.activeTab);
  const setBoardWidth = useUiStore((s) => s.setBoardWidth);
  const setScreenOrientation = useUiStore((s) => s.setScreenOrientation);

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
  }, [setBoardWidth, setScreenOrientation]);

  return (
    <Box sx={{display: 'flex', flexDirection: 'column', height: '100vh'}}>
      <Box sx={{height: navHeight}}>
      <Navigation />
      </Box>
      <Box sx={{flex: 1, marginTop: margin}}>

        {activeTab === 'play' && (
          <GameScreen />
        )}
        {activeTab === 'courses' && <Courses />}
        {activeTab === 'settings' && <Config />}
      </Box>
    </Box>
  );
}
