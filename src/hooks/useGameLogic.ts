import { useState, useEffect, useCallback } from "react";
import { Chess, Square } from "chess.js";
import { DefaultService } from "../api";
import { useAuthStore } from "../stores/authStore";
import { useGameStore } from "../stores/gameStore";

type SquareStyles = Record<string, Record<string, string>>;

interface ChessMove {
  from: string;
  to: string;
  promotion?: string;
}

export function useGameLogic() {
  const logout = useAuthStore((s) => s.logout);
  const position = useGameStore((s) => s.position);
  const setPosition = useGameStore((s) => s.setPosition);
  const gameState = useGameStore((s) => s.gameState);
  const setGameState = useGameStore((s) => s.setGameState);

  const [loading, setLoading] = useState(false);
  const [recieveTimeStamp, setRecieveTimeStamp] = useState<number | null>(null);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [infoAnimationKey, setInfoAnimationKey] = useState(0);
  const [showExploration, setShowExploration] = useState(false);

  const [squareStyles, setSquareStyles] = useState<{
    moveSquares: SquareStyles;
    optionSquares: SquareStyles;
    rightClickedSquares: SquareStyles;
  }>({
    moveSquares: {},
    optionSquares: {},
    rightClickedSquares: {},
  });
  const [showSquares, setShowSquares] = useState<string[]>([]);

  const getOrientation = (fen: string | undefined): "white" | "black" => {
    if (!fen) return "white";
    const game = new Chess(fen);
    return game.turn() === "w" ? "white" : "black";
  };

  const initGame = async () => {
    setLoading(true);
    try {
      const response = await DefaultService.initApiInitGet();
      setPosition(response.fen);
      setRecieveTimeStamp(Date.now());
      setGameState(response);
    } catch (err: any) {
      console.error("Error initializing game:", err);
      if (err.response && err.response.status === 401) {
        logout();
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!position) {
      initGame();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const makeMove = useCallback(
    async (move: ChessMove) => {
      const currentPosition = useGameStore.getState().position;
      const currentGameState = useGameStore.getState().gameState;

      if (!currentPosition) return;

      try {
        const gameCopy = new Chess(currentPosition);
        const result = gameCopy.move(move);

        if (result) {
          setPosition(gameCopy.fen());
          const elapsedTime = recieveTimeStamp
            ? (Date.now() - recieveTimeStamp) / 1000
            : -1;
          const response = await DefaultService.moveApiMovePost({
            state: currentGameState,
            from_square: move.from,
            to_square: move.to,
            elapsed_time: elapsedTime,
            piece: move.promotion || undefined,
          });

          const newGameCopy = new Chess(currentGameState.fen);

          if (response.state.mode === "show") {
            let showMove = newGameCopy.move(response.correct_move);
            setShowSquares([showMove.from, showMove.to]);
            newGameCopy.undo();
          } else {
            setShowSquares([]);
          }

          setGameState(response.state);
          setPosition(response.state.fen);
          setRecieveTimeStamp(Date.now());
          setExplanation(response.message);
          setInfoAnimationKey((prev) => prev + 1);

          setSquareStyles({
            moveSquares: {},
            optionSquares: {},
            rightClickedSquares: {},
          });
        }
      } catch (err: any) {
        console.error("Error making move:", err);
        if (err.response && err.response.status === 401) {
          logout();
        }
      }
    },
    [recieveTimeStamp, setGameState, setPosition, logout]
  );

  const onDrop = useCallback(
    (sourceSquare: Square, targetSquare: Square) => {
      makeMove({ from: sourceSquare, to: targetSquare, promotion: "q" });
      return true;
    },
    [makeMove]
  );

  const onSquareClick = useCallback(
    (square: Square) => {
      if (Object.keys(squareStyles.moveSquares).length > 0) {
        const move = {
          from: Object.keys(squareStyles.moveSquares)[0],
          to: square,
          promotion: "q",
        };
        setSquareStyles((prev) => ({
          ...prev,
          moveSquares: {},
          optionSquares: {},
        }));
        makeMove(move);
        return;
      }

      const currentPosition = useGameStore.getState().position;
      if (!currentPosition) return;
      const game = new Chess(currentPosition);
      const piece = game.get(square);
      if (piece && piece.color === (game.turn() === "w" ? "w" : "b")) {
        const moveSquares: SquareStyles = {
          [square]: { background: "rgba(100, 100, 255, 0.3)" },
        };
        const moves = game.moves({ square, verbose: true });
        const optionSquares: SquareStyles = {};
        moves.forEach((move) => {
          optionSquares[move.to] = {
            background: "rgba(0, 128, 0, 0.2)",
            borderRadius: "50%",
            boxShadow: "inset 0 0 0 8px rgba(0, 128, 0, 0.1)",
          };
        });
        setSquareStyles((prev) => ({ ...prev, moveSquares, optionSquares }));
      }
    },
    [makeMove, squareStyles.moveSquares]
  );

  const onSquareRightClick = useCallback((_square: Square) => {}, []);

  return {
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
  };
}
