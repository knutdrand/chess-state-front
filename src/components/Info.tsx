import { Box, Button, Link, Typography } from "@mui/material";
import { OpenInFull } from "@mui/icons-material";
import React, { useState, useEffect } from "react";

interface InfoProps {
  mode: string;
  feedback: string;
  width: string;
  link: string | null;
  onExplanation: () => void;
  animationKey?: number; // Add this prop to trigger animation
}

export function Info({ mode, width, link, onExplanation, animationKey = 0 }: InfoProps) {
  const [visible, setVisible] = useState(true);
  
  // Reset animation when animationKey, mode, or link changes
  useEffect(() => {
    setVisible(false);
    const timer = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(timer);
  }, [animationKey, mode, link]);

  // Determine border color based on mode
  const getBorderColor = () => {
    if (mode === "show") return "error.main";
    if (mode === "repeat") return "warning.main";
    return "success.main";
  };

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
      <Box
        sx={{
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexDirection: "row",
          padding: 1,
          bgcolor: "background.paper", // White background
          border: visible ? 5 : 0,
          borderColor: getBorderColor(),
          borderRadius: 1,
          transition: "border 0.2s ease-in-out",
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
      </Box>
    </Box>
  );
}
