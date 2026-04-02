import { Box, Button, Collapse, Link, Typography } from "@mui/material";
import { OpenInFull, ExpandMore, ExpandLess } from "@mui/icons-material";
import React, { useState, useEffect, useRef, useCallback } from "react";

interface InfoProps {
  mode: string;
  feedback: string;
  width: string;
  link: string | null;
  onExplanation: () => void;
  animationKey?: number;
}

export function Info({ mode, width, link, onExplanation, animationKey = 0 }: InfoProps) {
  const [visible, setVisible] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setVisible(false);
    setExpanded(false);
    const timer = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(timer);
  }, [animationKey, mode, link]);

  const checkOverflow = useCallback(() => {
    const el = textRef.current;
    if (el) {
      setIsOverflowing(el.scrollHeight > el.clientHeight);
    }
  }, []);

  useEffect(() => {
    checkOverflow();
    window.addEventListener('resize', checkOverflow);
    return () => window.removeEventListener('resize', checkOverflow);
  }, [checkOverflow, link, visible]);

  const getBorderColor = () => {
    if (mode === "show") return "error.main";
    if (mode === "repeat") return "warning.main";
    return "success.main";
  };

  function getElement() {
    if (link && typeof link === "string" && link.startsWith("http")) {
      return (
        <Link href={link} target="_blank" rel="noopener noreferrer">
          View in Chessable
        </Link>
      );
    } else {
      return <span>{link}</span>;
    }
  }

  return (
    <Box
      sx={{
        width: width,
        flex: 1,
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          padding: 1,
          bgcolor: "background.paper",
          border: visible ? 5 : 0,
          borderColor: getBorderColor(),
          borderRadius: 1,
          transition: "border 0.2s ease-in-out",
          flex: 1,
          minHeight: 0,
          overflow: "hidden",
        }}
      >
        <Box sx={{
          display: "flex",
          flexDirection: "row",
          alignItems: "flex-start",
          width: "100%",
          gap: 1,
          flex: 1,
          minHeight: 0,
        }}>
          <Box sx={{ flex: 1, minHeight: 0, overflow: "hidden" }}>
            <Collapse in={!expanded} collapsedSize="100%">
              <Typography
                ref={textRef}
                sx={{
                  display: '-webkit-box',
                  textOverflow: "ellipsis",
                  overflow: "hidden",
                  WebkitBoxOrient: "vertical",
                  WebkitLineClamp: expanded ? 'unset' : 3,
                  fontSize: "0.95rem",
                  lineHeight: 1.4,
                }}
              >
                {getElement()}
              </Typography>
            </Collapse>
          </Box>
          <Box sx={{ display: "flex", flexDirection: "column", flexShrink: 0, gap: 0.5 }}>
            {isOverflowing && (
              <Button
                onClick={() => setExpanded(!expanded)}
                sx={{
                  minWidth: "32px",
                  height: "32px",
                  padding: 0.5,
                }}
                size="small"
              >
                {expanded ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
              </Button>
            )}
            <Button
              onClick={onExplanation}
              sx={{
                minWidth: "32px",
                height: "32px",
                padding: 0.5,
              }}
              size="small"
            >
              <OpenInFull fontSize="small" />
            </Button>
          </Box>
        </Box>
      </Box>

      {expanded && (
        <Box
          onClick={() => setExpanded(false)}
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: "rgba(0,0,0,0.5)",
            zIndex: 1200,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            p: 2,
          }}
        >
          <Box
            onClick={(e) => e.stopPropagation()}
            sx={{
              bgcolor: "background.paper",
              borderRadius: 2,
              p: 3,
              maxWidth: "90vw",
              maxHeight: "80vh",
              overflow: "auto",
              border: 5,
              borderColor: getBorderColor(),
            }}
          >
            <Typography sx={{ fontSize: "0.95rem", lineHeight: 1.5 }}>
              {getElement()}
            </Typography>
            <Button
              onClick={() => setExpanded(false)}
              sx={{ mt: 2 }}
              variant="outlined"
              size="small"
            >
              Close
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
}
