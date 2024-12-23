import React, { useState } from "react";
import { Chessboard } from "react-chessboard";


interface ExplainedPosition {
    fen: string;
    comment: string;
}
const example_positions: ExplainedPosition[] = [
    {
        fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
        comment: "This is the starting position of a chess game.",
    },
    {
        fen: "rnbqkbnr/pppppppp/8/8/8/4P3/PPPP1PPP/RNBQKBNR b KQkq - 0 1",
        comment: "E2 to E4: White opens with King's Pawn.",
    },
    {
        fen: "rnbqkbnr/pppp1ppp/8/4p3/8/4P3/PPPP1PPP/RNBQKBNR w KQkq - 0 2",
        comment: "E7 to E5: Black mirrors the move.",
    },
];

const Exploration2: React.FC = () => {
  const [position, setPosition] = useState<string>("start");
  const [moveIndex, setMoveIndex] = useState<number>(0);
  const explanations = example_positions;
  // Example explanation array for each position

  const goBack = () => {
    if (moveIndex > 0) {
      setMoveIndex(moveIndex - 1);
    }
  };

  const goForward = () => {
    if (moveIndex < example_positions.length - 1) {
      setMoveIndex(moveIndex + 1);
    }
  };
  const flexDirection = window.innerWidth > window.innerHeight ? "row" : "column";
  const crossAxis = window.innerWidth > window.innerHeight ? "column" : "row";
  return (
    <div
      style={{
        display: "flex",
        flexDirection: flexDirection,
        height: "100vh",
        width: "100vw",
        padding: "10px",
        boxSizing: "border-box",
      }}
    >
      {/* Chessboard Section */}
      <div
        style={{
          flex: window.innerWidth > window.innerHeight ? 1 : "auto",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Chessboard
          boardWidth={Math.min(window.innerHeight, window.innerWidth) * 0.95}
          position={explanations[moveIndex].fen}
        />
      </div>

      {/* Explanations and Navigation Section */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: crossAxis,
          justifyContent: "space-between",
          alignItems: "center",
          padding: "10px",
          maxHeight: "100%",
        }}
      >
        <div style={{ flex: 1 }}>
          <p>{explanations[moveIndex].comment}</p>
        </div>

        {/* Navigation */}
        <div
          style={{
            flex: 0.5,
            display: "flex",
            justifyContent: "space-between",
            width: "100%",
            maxWidth: "400px",
          }}
        >
          <div style={{ display: "flex", height: "100%", flexDirection: flexDirection}}>
          <img src="/teacher2.jpg" alt="teacher" style={{width: "70%", height: "100%"}}/>
          <div style={{display: "flex", flexDirection: 'row'}    }>
          <button
            onClick={goBack}
            disabled={moveIndex === 0}
            style={{ flex: 1, marginRight: "5px", padding: "5px" }}
          >
            &lt;
          </button>
          <button
            onClick={goForward}
            disabled={moveIndex === explanations.length - 1}
            style={{ flex: 1, marginLeft: "5px", padding: "5px" }}
          >
            &gt;
          </button>
            </div>
          </div>
          </div>
        </div>
      </div>
  );
};

export default Exploration2;
