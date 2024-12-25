import { Box, Alert, Button, Link } from "@mui/material";
import { OpenInFull } from "@mui/icons-material";
import React from "react";


interface InfoProps {
  mode: string;
  feedback: string;
  width: string;
  link: string;
  onExplanation: () => void;
}

export function Info({ mode, feedback, width, link, onExplanation }: InfoProps) {
  const text = mode === "show" ? {feedback} : "Repeat the move";
  const variant = mode === "show" ? "error" : "warning";

  function getElement() {
    // Check if the link starts with http or https
    if (link && typeof link === "string" && link.startsWith("http")) {
      return (
        <Link href={link} target="_blank" rel="noopener noreferrer">
          View in Chessable
        </Link>
      );
    } else {
      return <div>{link}</div>;
    }
  }

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
        severity={variant}
        icon={false} // Removes the default icon
        sx={{
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexDirection: "row",
          padding: "16px",
        }}
      >
        <div style={{ display: "flex", flexDirection: "row", alignItems: "space-between" }}>
        <div >{getElement()}</div>

        <Button
          onClick={onExplanation}
          sx={{
            flexShrink: 0,
            minWidth: "auto",
            padding: 1,
            marginLeft: 2,
          }}
        >
          <OpenInFull/>
        </Button>
        </div>
      </Alert>
    </Box>
  );
}
