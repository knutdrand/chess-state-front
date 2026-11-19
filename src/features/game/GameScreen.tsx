import React, { useCallback } from "react";
import { Square } from "chess.js";
import { Chessboard } from "react-chessboard";
import { Box, Button, CircularProgress, Typography } from "@mui/material";
import SchoolIcon from "@mui/icons-material/School";
import { Info } from "./Info";
import { FocusChip } from "./FocusChip";
import { ApiExploration } from "../exploration/ExplorationModern";
import { useUiStore } from "../../stores/uiStore";
import { useGameLogic } from "../../hooks/useGameLogic";
import { useKeepAwake } from "../../native/useKeepAwake";
import { boardPadding } from "../../components/layout";

export function GameScreen() {
  const boardWidth = useUiStore((s) => s.boardWidth);
  const orientation = useUiStore((s) => s.screenOrientation);
  useKeepAwake();
  const setActiveTab = useUiStore((s) => s.setActiveTab);

  const {
    position,
    gameState,
    loading,
    explanation,
    infoAnimationKey,
    showExploration,
    setShowExploration,
    squareStyles,
    showSquares,
    getOrientation,
    onDrop,
    onSquareClick,
    onSquareRightClick,
  } = useGameLogic();

  const handleExploration = useCallback(() => {
    setShowExploration(true);
  }, [setShowExploration]);

  const handleExplorationExit = useCallback(() => {
    setShowExploration(false);
  }, [setShowExploration]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!position && !loading) {
    // New account, or every chapter disabled: nothing to train on yet.
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%", p: 4 }}>
        <Box sx={{ textAlign: "center", maxWidth: 420 }}>
          <SchoolIcon color="primary" sx={{ fontSize: 56, mb: 1 }} />
          <Typography variant="h5" gutterBottom>
            Add a course to start training
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            Training uses the openings in your enabled courses. Pick a built-in
            repertoire, upload your own PGN, or import a Lichess study.
          </Typography>
          <Button variant="contained" size="large" onClick={() => setActiveTab("courses")}>
            Go to Courses
          </Button>
        </Box>
      </Box>
    );
  }

  if (showExploration && position) {
    return (
      <ApiExploration
        fen={position}
        onExit={handleExplorationExit}
        boardOrientation={getOrientation(gameState?.fen)}
      />
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: orientation === "row" ? "row" : "column",
        justifyContent: orientation === "row" ? "center" : "flex-start",
        height: "100%",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          width: boardWidth,
          height: boardWidth,
          p: `${boardPadding()}px`,
          boxSizing: "content-box",
          flexShrink: 0,
          mx: orientation === "row" ? 0 : "auto",
        }}
      >
        <Chessboard
          position={position ?? undefined}
          onPieceDrop={onDrop}
          onSquareClick={onSquareClick}
          onSquareRightClick={onSquareRightClick}
          boardOrientation={getOrientation(gameState?.fen)}
          customArrows={
            showSquares.length >= 2
              ? [[showSquares[0] as Square, showSquares[1] as Square]]
              : []
          }
          customSquareStyles={{
            ...squareStyles.moveSquares,
            ...squareStyles.optionSquares,
            ...squareStyles.rightClickedSquares,
          }}
        />
      </Box>

      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          minHeight: 0,
          minWidth: 0,
          maxWidth: orientation === "row" ? 560 : "none",
          p: 1,
          boxSizing: "border-box",
        }}
      >
        <FocusChip />
        <Info
          link={explanation}
          mode={gameState?.mode || "play"}
          animationKey={infoAnimationKey}
          onExplanation={handleExploration}
          width="100%"
        />
      </Box>
    </Box>
  );
}
