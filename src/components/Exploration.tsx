import React, {useState} from "react";
import {Chessboard} from "react-chessboard" // @types/react-chessboard is not available
import "bootstrap/dist/css/bootstrap.min.css";



interface ExplainedPosition {
    fen: string;
    comment: string;
}

const example_positions: ExplainedPosition[] = [{fen:"rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
  comment: "This is the starting position of a chess game."}];
                                          
  

interface ExplorationProps {
    positions: ExplainedPosition[];
    orientation: 'white' | 'black';
    activePosition: number;
}

const example_props: ExplorationProps = {
    positions: example_positions,
    orientation: 'white',
    activePosition: 0
}

export function Exploration(props: ExplorationProps): React.ReactElement {
  props = {...example_props, ...props};
  const [activePosition, setActivePosition] = useState(props.activePosition);
  return (
    <div>
    <Chessboard
      position={props.positions[activePosition].fen}
      boardOrientation={props.orientation}
      boardWidth={400}
    />
    <p>{props.positions[activePosition].comment}</p>
    </div>
    );
}
