import React, { useState, useEffect } from "react";
import { Chessboard } from "react-chessboard";
import { DefaultService } from '../api';
import { Box, Pagination, PaginationItem } from "@mui/material";


interface ExplainedPosition {
    fen: string;
    explanation: string;
}


interface ExplorationProps {
    explanations: ExplainedPosition[];
    onExit?: () => void;
    cur_index: number;
}

const ExampleExploration: React.FC<ExplorationProps> = () => {
    const example_positions: ExplainedPosition[] = [
        {
            fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
            explanation: "This is the starting position of a chess game.",
        },
        {
            fen: "rnbqkbnr/pppppppp/8/8/8/4P3/PPPP1PPP/RNBQKBNR b KQkq - 0 1",
            explanation: "E2 to E4: White opens with King's Pawn.",
        },
        {
            fen: "rnbqkbnr/pppp1ppp/8/4p3/8/4P3/PPPP1PPP/RNBQKBNR w KQkq - 0 2",
            explanation: "E7 to E5: Black mirrors the move.",
        },
    ];


    return (
        <Exploration2 explanations={example_positions} cur_index={0}/>
    );
}

const Exploration2: React.FC<ExplorationProps> = ({ explanations, cur_index, onExit }) => {
  const [moveIndex, setMoveIndex] = useState<number>(cur_index);

  const isLandscape = window.innerWidth > window.innerHeight;
  const flexDirection = isLandscape ? "row" : "column";
  const crossAxis = isLandscape ? "column" : "row";

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection,
        height: "calc(100vh - 60px)",
        width: "100vw",
        p: 1.25,
        boxSizing: "border-box",
      }}
    >
      {/* Chessboard Section */}
      <Box
        sx={{
          flex: isLandscape ? 1 : "auto",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Chessboard
          boardWidth={Math.min(window.innerHeight - 60, window.innerWidth) * 0.95}
          position={explanations[moveIndex].fen}
        />
      </Box>

      {/* Explanations and Navigation Section */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: crossAxis,
          justifyContent: "space-between",
          alignItems: "center",
          p: 1.25,
          maxHeight: "100%",
        }}
      >
        <Box sx={{ flex: 1 }}>
          <Pagination
            count={explanations.length}
            page={moveIndex + 1}
            onChange={(event, value) => setMoveIndex(value - 1)}
            sx={{ whiteSpace: 'nowrap', overflow: 'hidden' }}
            renderItem={(item) =>
              <PaginationItem
                {...item}
                sx={{
                  color: item.page && explanations[item.page - 1].explanation === ''
                    ? 'primary.main'
                    : 'background.default',
                }}
              />
            }
          />
          <p>{explanations[moveIndex > 0 ? moveIndex - 1 : 0].explanation}</p>
        </Box>

        {/* Navigation */}
        <Box
          sx={{
            flex: 0.5,
            display: "flex",
            justifyContent: "space-between",
            width: "100%",
            maxWidth: 400,
          }}
        >
          <Box sx={{ display: "flex", height: "100%", flexDirection }}>
            <Box
              component="img"
              src="/teacher4.jpg"
              alt="teacher"
              sx={{ width: "70%", height: "100%" }}
            />
            <Box sx={{ display: "flex", flexDirection: 'row' }}>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

interface ApiExplorationProps {
  fen: string;
  onExit: () => void;
}

interface ExplanationResult {
    explanations: ExplainedPosition[];
    cur_index: number;
    }

const ApiExploration: React.FC<ApiExplorationProps> = ({ fen, onExit }) => {
  const [explorations, setExplorations] = useState<ExplanationResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchExplorations = async () => {
        const urlifiedFen = fen.replace(/ /g, "_").replace(/\//g, '+');
      try {
        const response = await DefaultService.explanationApiExplanationFenGet(urlifiedFen);
        console.log(response);
        setExplorations(response as unknown as ExplanationResult);
      } catch (err) {
        setError("Failed to fetch exploration data");
      } finally {
        setLoading(false);
      }
    };

    fetchExplorations();
  }, [fen]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }
  if (!explorations) {
    return <div>No data found</div>;
  }
  return <Exploration2 explanations={explorations.explanations} onExit={onExit} cur_index={explorations.cur_index}/>;
};

export default Exploration2;
export { ExampleExploration, ApiExploration };
