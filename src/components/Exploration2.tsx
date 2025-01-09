import axios from "axios";
import React, { useState, useEffect } from "react";
import IconButton from '@mui/material/IconButton';
import { ArrowForwardIos, ArrowBackIos, ExitToApp } from "@mui/icons-material";
import { Chessboard } from "react-chessboard";
import {apiUrl} from '../config';


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
    // Example explanation array for each position

  const goBack = () => {
    if (moveIndex > 0) {
      setMoveIndex(moveIndex - 1);
    }
  };

  const goForward = () => {
    if (moveIndex < explanations.length - 1) {
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
        height: "100vh-60px",
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
          boardWidth={Math.min(window.innerHeight-60, window.innerWidth) * 0.95}
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
          <p>{explanations[moveIndex>0? moveIndex-1: 0].explanation}</p>
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
          <img src="/teacher4.jpg" alt="teacher" style={{width: "70%", height: "100%"}}/>
          <div style={{display: "flex", flexDirection: 'row'}    }>
          <IconButton 
            onClick={goBack}
            disabled={moveIndex === 0}
          >
            <ArrowBackIos />
          </IconButton>
          <IconButton 
            onClick={goBack}
            
            disabled={moveIndex === explanations.length - 1}
          >
            <ArrowForwardIos />
          </IconButton>
{/*           <button
            onClick={goBack}
            disabled={moveIndex === 0}
            style={{ flex: 1, marginRight: "5px", padding: "5px" }}
          >
            &lt;
          </button> */}
          {/* <button
            onClick={goForward}
            disabled={moveIndex === explanations.length - 1}
            style={{ flex: 1, marginLeft: "5px", padding: "5px" }}
          >
            
            &gt;
          </button> */}
          <IconButton onClick={onExit}>
            <ExitToApp />
          </IconButton>
          {/* <button onClick={onExit} style={{ flex: 1, padding: "5px" }}>
            Exit
            </button> */}
            </div>
          </div>
          </div>
        </div>
      </div>
  );
};

interface ApiExplorationProps {
    fen: string;
    token: string;
}




interface ApiExplorationProps {
  fen: string;
  token: string;
    onExit: () => void; 
}

interface ExplanationResult {
    explanations: ExplainedPosition[];
    cur_index: number;
    }

const ApiExploration: React.FC<ApiExplorationProps> = ({ fen, token, onExit }) => {
  const [explorations, setExplorations] = useState<ExplanationResult | null>(null); // State to store fetched data
  const [loading, setLoading] = useState(true); // State to handle loading
  const [error, setError] = useState<string | null>(null); // State for error handling

  useEffect(() => {
    const fetchExplorations = async () => {
        const urlifiedFen = fen.replace(/ /g, "_").replace(/\//g, '+');
        const url = apiUrl + "/explanation/" + urlifiedFen;
        console.log(url);
      try {
        const response = await axios.get(url, {
          headers: {
            accept: "application/json",
            Authorization: "Bearer " + token,
          },
        });
        console.log(response.data);
        setExplorations(response.data); // Save the data
      } catch (err) {
        setError("Failed to fetch exploration data");
      } finally {
        setLoading(false); // Stop the loading indicator
      }
    };

    fetchExplorations();
  }, [fen, token]); // Dependencies ensure this effect runs when `fen` or `token` changes

  if (loading) {
    return <div>Loading...</div>; // Loading indicator
  }

  if (error) {
    return <div>Error: {error}</div>; // Error message
  }
  if (!explorations) {
    return <div>No data found</div>; // No data message
  }
  return <Exploration2 explanations={explorations.explanations} onExit={onExit} cur_index={explorations.cur_index}/>; // Pass fetched data to Exploration2
};

export default Exploration2;
export { ExampleExploration, ApiExploration };
