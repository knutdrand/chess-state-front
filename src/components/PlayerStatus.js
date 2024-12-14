import {Alert, Button, ProgressBar} from "react-bootstrap";
import React from "react";

export function PlayerStatus({score, width, onSolution}) {
    const roundedDownScore = Math.floor(score);
    const progress = (score - roundedDownScore) * 100;

    return (
        <div>
        <Alert variant='success' style={{ width: width }} className="text-center d-flex align-items-center justify-content-between">
        
            <ProgressBar
                now={progress}
                label={`Level: ${roundedDownScore}`}
                className="mt-2"
                variant="info"
                style={{width: 0.75*width}}
            />
            <Button width={width*0.2} onClick={onSolution}>Solution</Button>
        </Alert>
        </div>               
    );
}
////<Alert variant='success' style={{width: width}} className="text-center">