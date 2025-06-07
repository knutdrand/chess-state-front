import { Box, Alert, Button, Link, Typography } from "@mui/material";
import { OpenInFull } from "@mui/icons-material";
import React from "react";


interface InfoProps {
  mode: string;
  feedback: string;
  width: string;
  link: string | null;
  onExplanation: () => void;
}

export function Info({ mode, width, link, onExplanation }: InfoProps) {
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
        maxHeight: '100px',//'calc(100vh-${width}px-60px-16px)',
        margin: 2,
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
          padding: 2,
        }}
      >
        <Box sx={{ display: "flex", flexDirection: "row", alignItems: "space-between" }}>
        <Box sx={{flex: 1}}>
        <Typography sx={{display: '-webkit-box',
          textOverflow: "ellipsis", overflow: "hidden", maxHeight: "100px", WebkitBoxOrient: "vertical",
    WebkitLineClamp: 3,}}>
          {getElement()}    
          </Typography>
        </Box>
        <Button
          onClick={onExplanation}
          sx={{
            flexShrink: 0,
            minWidth: "auto",
            padding: 1,
            mx: 2,
          }}
        >
          <OpenInFull/>
        </Button>
        </Box>
      </Alert>
    </Box>
  );
}
