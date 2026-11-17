import React, {useEffect, useRef, useState, useCallback, lazy, Suspense} from "react";
import debounce from "lodash/debounce";
import {GameScreen} from "../features/game/GameScreen";
import Config from "../features/settings/Config";
import {Navigation} from "./Navigation";
import { Box } from "@mui/material";
import { useUiStore } from '../stores/uiStore';
import { LoadingFallback } from "./LoadingFallback";

// Course management (tables, modals, tree explorer) is loaded on first visit.
const Courses = lazy(() => import('../features/courses/Courses'));


// Smallest explanation panel next to the board: below it in portrait,
// beside it in landscape. The page itself never scrolls.
const minInfoHeight = 128;
const minInfoWidth = 280;

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
    const vw = window.innerWidth;
    const available = vh - navH;
    // Landscape when a board-beside-panel layout gives a bigger board.
    const columnBoard = Math.min(available - minInfoHeight, vw);
    const rowBoard = Math.min(available, vw - minInfoWidth);
    const landscape = rowBoard > columnBoard;
    setBoardWidth(Math.max(0, Math.floor(landscape ? rowBoard : columnBoard)));
    setScreenOrientation(landscape ? 'row' : 'column');
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
        {activeTab === 'courses' && (
          <Suspense fallback={<LoadingFallback />}>
            <Courses />
          </Suspense>
        )}
        {activeTab === 'settings' && <Config />}
      </Box>
    </Box>
  );
}
