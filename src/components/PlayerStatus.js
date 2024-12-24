import React from "react";
import { Box, Button, LinearProgress, Alert } from "@mui/material";
import KeyIcon from "@mui/icons-material/Key";

export function PlayerStatus({ score, width, onSolution }) {
  const roundedDownScore = Math.floor(score);
  const progress = (score - roundedDownScore) * 100;

  return (
    <Box
      sx={{
        width: width,
        display: "flex",
        margin: "16px auto",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Alert
        severity="success"
        sx={{
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexDirection: "row",
          padding: "16px",
        }}
      >
        {/* <Box sx={{ flex: 1 }}>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{ width: "75%", margin: "auto", mb: 2 }}
          />
          <Box textAlign="center">Level: {roundedDownScore}</Box>
        </Box> */}
        <Button
          onClick={onSolution}
          sx={{
            flexShrink: 0,
            minWidth: "auto",
            padding: 1,
            marginLeft: 2,
          }}
        >
          <KeyIcon />
        </Button>
      </Alert>
    </Box>
  );
}
/* 

import {Alert, Button, ProgressBar} from "react-bootstrap";
import KeyIcon from '@mui/icons-material/Key';
import React from "react";

export function PlayerStatus({score, width, onSolution}) {
    const roundedDownScore = Math.floor(score);
    const progress = (score - roundedDownScore) * 100;

    return (
        <div>
        <Alert variant='success' style={{ width: width }} className="text-center d-flex align-items-center justify-content-between">
        
        {     <ProgressBar
                now={progress}
                label={`Level: ${roundedDownScore}`}
                className="mt-2"
                variant="info"
                style={{width: 0.75*width}}
            />
         }    <Button width={width*0.2} onClick={onSolution}><KeyIcon/></Button>

        </Alert>
        </div>               
    );
}
////<Alert variant='success' style={{width: width}} className="text-center"> */