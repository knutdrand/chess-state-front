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
  const variant = mode === "show" ? "error" : (mode === "repeat" ? "warning" : "info");

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
        maxHeight: '300px',
        margin: 1,
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
          alignItems: "flex-start",
          flexDirection: "row",
          padding: 1,
        }}
      >
        <Box sx={{ 
          display: "flex", 
          flexDirection: "row", 
          alignItems: "flex-start", 
          width: "100%",
          gap: 1
        }}>
          <Box sx={{ flex: 1 }}>
            <Typography 
              sx={{
                display: '-webkit-box',
                textOverflow: "ellipsis", 
                overflow: "auto",
                maxHeight: "270px",
                WebkitBoxOrient: "vertical",
                WebkitLineClamp: 15,
                fontSize: "0.95rem",
                lineHeight: 1.4,
              }}
            >
              {getElement()}    
            </Typography>
          </Box>
          <Button
            onClick={onExplanation}
            sx={{
              flexShrink: 0,
              minWidth: "32px",
              height: "32px",
              padding: 0.5,
              alignSelf: "flex-start",
            }}
            size="small"
          >
            <OpenInFull fontSize="small" />
          </Button>
        </Box>
      </Alert>
    </Box>
  );
}
