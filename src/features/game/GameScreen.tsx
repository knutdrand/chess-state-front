import React, { useCallback } from "react";
import { Square } from "chess.js";
import { Chessboard } from "react-chessboard";
import { Box, CircularProgress } from "@mui/material";
import { Info } from "./Info";
import { ApiExploration } from "../exploration/ExplorationModern";
import { useUiStore } from "../../stores/uiStore";
import { useGameLogic } from "../../hooks/useGameLogic";

export function GameScreen() {
  const boardWidth = useUiStore((s) => s.boardWidth);

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
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%", p: 4 }}>
        <Box sx={{ textAlign: "center" }}>
          <h2>No courses available</h2>
          <p>Please contact an administrator to set up courses for your account.</p>
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
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      <Box sx={{ width: boardWidth, height: boardWidth, margin: "0 auto" }}>
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

      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minHeight: 0, px: 1 }}>
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
