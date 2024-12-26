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
        height: '100%',
        margin: 1,
      }}
    >
      <Alert
        severity="success"
        icon={false}
        sx={{
          width: "100%",
          height: '100%',
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexDirection: "row",
          padding: 2,
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
