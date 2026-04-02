import React, {useEffect, useRef, useState, useCallback} from "react";
import {debounce} from "lodash";
import {GameScreen} from "../features/game/GameScreen";
import Config from "../features/settings/Config";
import {Navigation} from "./Navigation";
import Courses from '../features/courses/Courses';
import { Box } from "@mui/material";
import { useUiStore } from '../stores/uiStore';


const minInfoHeight = 128;

export function MainScreen() {
  const activeTab = useUiStore((s) => s.activeTab);
  const setBoardWidth = useUiStore((s) => s.setBoardWidth);
  const setScreenOrientation = useUiStore((s) => s.setScreenOrientation);
  const [viewportHeight, setViewportHeight] = useState(window.innerHeight);
  const navRef = useRef<HTMLDivElement>(null);

  const updateLayout = useCallback(() => {
    const vh = window.innerHeight;
    setViewportHeight(vh);
    const navH = navRef.current ? navRef.current.offsetHeight : 64;
    const maxBoardHeight = vh - navH - minInfoHeight;
    const maxBoardWidth = window.innerWidth;
    const newBoardWidth = Math.min(maxBoardHeight, maxBoardWidth);
    setBoardWidth(newBoardWidth);
    setScreenOrientation('column');
  }, [setBoardWidth, setScreenOrientation]);

  useEffect(() => {
    const debouncedUpdate = debounce(updateLayout);
    debouncedUpdate();
    window.addEventListener('resize', debouncedUpdate);
    return () => window.removeEventListener('resize', debouncedUpdate);
  }, [updateLayout]);

  return (
    <Box sx={{display: 'flex', flexDirection: 'column', height: viewportHeight, overflow: 'hidden'}}>
      <Box ref={navRef}>
        <Navigation />
      </Box>
      <Box sx={{flex: 1, overflow: 'hidden', minHeight: 0}}>

        {activeTab === 'play' && (
          <GameScreen />
        )}
        {activeTab === 'courses' && <Courses />}
        {activeTab === 'settings' && <Config />}
      </Box>
    </Box>
  );
}
