import { useState, useEffect, useCallback } from "react";
import { Chess, Square } from "chess.js";
import { DefaultService } from "../api";
import { useNotification } from "./useNotification";
import { getErrorStatus, isUnauthorized } from "../utils/errors";
import { useGameStore } from "../stores/gameStore";
import { moveFeedback } from "../native/feedback";

type SquareStyles = Record<string, Record<string, string>>;

interface ChessMove {
  from: string;
  to: string;
  promotion?: string;
}

export function useGameLogic() {
  const { notify, notifyError } = useNotification();
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

  const initGame = useCallback(async () => {
    setLoading(true);
    try {
      const response = await DefaultService.initApiInitGet();
      setGameState(response);
      if (response.mode === "empty") {
        // No enabled courses yet: GameScreen shows the "add a course" screen.
        setPosition(null);
        return;
      }
      setPosition(response.fen);
      setRecieveTimeStamp(Date.now());
    } catch (err: unknown) {
      console.error("Error initializing game:", err);
      // 401s are handled globally by the httpClient interceptor.
      if (!isUnauthorized(err)) {
        notifyError("Could not load a position. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }, [setGameState, setPosition, notifyError]);

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

          moveFeedback(response.state.mode !== "show");
          if (response.state.mode === "show") {
            const showMove = newGameCopy.move(response.correct_move);
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
      } catch (err: unknown) {
        if (getErrorStatus(err) === 409) {
          // The position is no longer in an enabled chapter (e.g. the course
          // was disabled or deleted): fetch a fresh one.
          notify("That position is no longer in your enabled courses. Loading a new one.", "info");
          initGame();
          return;
        }
        console.error("Error making move:", err);
        if (!isUnauthorized(err)) {
          notifyError("Could not submit your move. Please try again.");
        }
      }
    },
    [recieveTimeStamp, setGameState, setPosition, notifyError, notify, initGame]
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
