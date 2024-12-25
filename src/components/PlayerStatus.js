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
