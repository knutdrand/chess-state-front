import React, {useEffect, useState} from "react";
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

export function MainScreen() {
  const activeTab = useUiStore((s) => s.activeTab);
  const setBoardWidth = useUiStore((s) => s.setBoardWidth);
  const setScreenOrientation = useUiStore((s) => s.setScreenOrientation);
  const [viewportHeight, setViewportHeight] = useState(window.innerHeight);

  useEffect(() => {
    const updateLayout = debounce(() => {
      const vh = window.innerHeight;
      setViewportHeight(vh);
      const maxBoardHeight = vh - navHeight - minInfoHeight;
      const maxBoardWidth = window.innerWidth;
      const newBoardWidth = Math.min(maxBoardHeight, maxBoardWidth);
      setBoardWidth(newBoardWidth);
      setScreenOrientation('column');
    });
    updateLayout();
    window.addEventListener('resize', updateLayout);
    return () => window.removeEventListener('resize', updateLayout);
  }, [setBoardWidth, setScreenOrientation]);

  return (
    <Box sx={{display: 'flex', flexDirection: 'column', height: viewportHeight}}>
      <Box sx={{height: navHeight}}>
      <Navigation />
      </Box>
      <Box sx={{flex: 1, overflow: 'hidden'}}>

        {activeTab === 'play' && (
          <GameScreen />
        )}
        {activeTab === 'courses' && <Courses />}
        {activeTab === 'settings' && <Config />}
      </Box>
    </Box>
  );
}
