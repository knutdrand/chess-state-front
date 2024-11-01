import {Alert, ProgressBar} from "react-bootstrap";
import React from "react";

export function PlayerStatus({score, width}) {
    const roundedDownScore = Math.floor(score);
    const progress = (score - roundedDownScore) * 100;

    return (
        <Alert variant='success' style={{width: width}} className="text-center">
            <ProgressBar
                now={progress}
                label={`Level: ${roundedDownScore}`}
                className="mt-2"
                variant="info"
            />
        </Alert>
    );
}